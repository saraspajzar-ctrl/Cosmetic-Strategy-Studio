"""
FastAPI backend for the Beauty Product Intelligence App.

Run:
    uvicorn backend.main:app --reload
"""
import sys
import numpy as np
import pandas as pd
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import (
    ProductInput, RatingPrediction, PricePrediction, BothPrediction, FeatureImportance,
    PortfolioRequest, PortfolioProduct, CategoryAllocation, PortfolioResponse,
)
from src.utils import load_model, load_json, price_segment
from src.features import parse_product_size_ml
from src.config import MODELS_DIR, CLASSIFICATION_FEATURES, REGRESSION_FEATURES_NO_RATING

state: Dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    _load_state()
    yield


def _load_state():
    required_files = [
        "classifier_best.joblib",
        "regressor_best.joblib",
        "classifier_metadata.json",
        "regressor_metadata.json",
        "leaderboard_classification.json",
        "leaderboard_regression.json",
        "data_summary.json",
    ]
    missing = [f for f in required_files if not (MODELS_DIR / f).exists()]
    if missing:
        print(f"[WARNING] Missing model files: {missing}")
        print("  Run: python src/train_classification.py && python src/train_regression.py")

    loaders = {
        "classifier":       ("classifier_best.joblib",        load_model),
        "regressor":        ("regressor_best.joblib",         load_model),
        "classifier_meta":  ("classifier_metadata.json",      load_json),
        "regressor_meta":   ("regressor_metadata.json",       load_json),
        "leaderboard_clf":  ("leaderboard_classification.json", load_json),
        "leaderboard_reg":  ("leaderboard_regression.json",   load_json),
        "data_summary":     ("data_summary.json",             load_json),
    }
    for key, (filename, loader) in loaders.items():
        path = MODELS_DIR / filename
        if path.exists():
            state[key] = loader(path)

    # Load raw dataset for the Portfolio Optimizer
    raw_path = Path(__file__).resolve().parent.parent / "data" / "raw" / "most_used_beauty_cosmetics_products_extended.csv"
    if raw_path.exists():
        df = pd.read_csv(raw_path)
        m_reviews = float(df["Number_of_Reviews"].median())
        C_rating  = float(df["Rating"].mean())
        # Bayesian adjusted rating — pre-computed with global priors
        df["adjusted_rating"] = (
            (df["Number_of_Reviews"] / (df["Number_of_Reviews"] + m_reviews)) * df["Rating"] +
            (m_reviews / (df["Number_of_Reviews"] + m_reviews)) * C_rating
        )
        state["df"]               = df
        state["global_max_price"] = float(df["Price_USD"].max())
        state["global_avg_price"] = float(df["Price_USD"].mean())
        state["portfolio_options"] = {
            "categories":      sorted(df["Category"].dropna().unique().tolist()),
            "skin_types":      sorted(df["Skin_Type"].dropna().unique().tolist()),
            "gender_targets":  sorted(df["Gender_Target"].dropna().unique().tolist()),
            "main_ingredients":sorted(df["Main_Ingredient"].dropna().unique().tolist()),
            "countries":       sorted(df["Country_of_Origin"].dropna().unique().tolist()),
            "strategies": [
                {"value": "maximize_rating",  "label": "Maximize Rating Potential"},
                {"value": "maximize_value",   "label": "Maximize Value-for-Price"},
                {"value": "premium",          "label": "Build Premium Portfolio"},
                {"value": "budget_friendly",  "label": "Build Budget-Friendly Portfolio"},
            ],
        }


app = FastAPI(
    title="Beauty Product Intelligence API",
    description="Predict rating probability and price for cosmetics products.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cosmetic-strategy-studio.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _product_input_to_df(product: ProductInput) -> pd.DataFrame:
    df = pd.DataFrame([{
        "Brand":             product.Brand,
        "Category":          product.Category,
        "Usage_Frequency":   product.Usage_Frequency,
        "Number_of_Reviews": float(product.Number_of_Reviews),
        "Product_Size":      product.Product_Size,
        "Skin_Type":         product.Skin_Type,
        "Gender_Target":     product.Gender_Target,
        "Packaging_Type":    product.Packaging_Type,
        "Main_Ingredient":   product.Main_Ingredient,
        "Cruelty_Free":      product.Cruelty_Free,
        "Country_of_Origin": product.Country_of_Origin,
        "Rating":            product.Rating if product.Rating is not None else np.nan,
        "Price_USD":         0.0,  # placeholder, not used as feature
    }])
    # These two transforms mirror engineer_features() in src/features.py.
    # They are deterministic row-wise operations (no learned statistics),
    # so they are safe to apply here; but they must stay in sync with that function.
    df["Product_Size_ml"]   = df["Product_Size"].apply(parse_product_size_ml)
    df["Review_Count_Log"]  = np.log1p(df["Number_of_Reviews"].fillna(0))
    return df


def _get_category_avg_price(category: str) -> Optional[float]:
    summary = state.get("data_summary", {})
    entry = summary.get("category_averages", {}).get(category)
    return entry.get("Price_USD") if entry else None


def _make_recommendation(rating_prob: float, predicted_price: float, category: str) -> str:
    cat_avg = _get_category_avg_price(category) or predicted_price
    lines = []

    if rating_prob >= 0.65:
        lines.append("Strong rating probability — the product configuration looks competitive.")
    elif rating_prob >= 0.45:
        lines.append("Moderate rating probability. Consider reviewing ingredient and category positioning.")
    else:
        lines.append("Low rating probability. Revisit the formula, target skin type, or category fit.")

    ratio = predicted_price / cat_avg if cat_avg > 0 else 1.0
    if ratio > 1.20:
        lines.append(
            f"Predicted price is ~{(ratio-1)*100:.0f}% above the {category} average (${cat_avg:.0f}). "
            "Ensure the premium is justified by brand equity or unique ingredients."
        )
    elif ratio < 0.80:
        if rating_prob >= 0.55:
            lines.append("Below-average price with solid rating probability — strong value positioning.")
        else:
            lines.append("Below-average price. Could work as a budget entry, but review quality signals.")
    else:
        lines.append(f"Price is within the expected range for {category} products.")

    return " ".join(lines)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    models_loaded = "classifier" in state and "regressor" in state
    return {"status": "ok" if models_loaded else "degraded", "models_loaded": models_loaded}


@app.get("/metadata")
def metadata():
    return {
        "classifier": state.get("classifier_meta", {}),
        "regressor":  state.get("regressor_meta", {}),
    }


@app.get("/data/summary")
def data_summary():
    if "data_summary" not in state:
        raise HTTPException(503, "Data summary not loaded. Run training scripts first.")
    base = dict(state["data_summary"])
    # Augment with extra computed fields for Commercial Insights charts
    if "df" in state:
        df = state["df"]
        base["rating_distribution"] = (
            df["Rating"].dropna().round().astype(int)
            .value_counts().sort_index().to_dict()
        )
        base["country_avg_price"] = (
            df.groupby("Country_of_Origin")["Price_USD"].mean().round(2).to_dict()
        )
        cf = df.groupby("Cruelty_Free")["Rating"].mean().round(3)
        base["cruelty_free_avg_rating"] = {str(k): float(v) for k, v in cf.items()}
        base["n_brands"]     = int(df["Brand"].nunique())
        base["n_categories"] = int(df["Category"].nunique())
    return base


@app.get("/models/leaderboard")
def leaderboard():
    return {
        "classification": state.get("leaderboard_clf", []),
        "regression":     state.get("leaderboard_reg", []),
    }


@app.post("/predict/rating", response_model=RatingPrediction)
def predict_rating(product: ProductInput):
    if "classifier" not in state:
        raise HTTPException(503, "Classifier not loaded. Run training scripts first.")

    df = _product_input_to_df(product)
    X  = df[CLASSIFICATION_FEATURES]

    pred = int(state["classifier"].predict(X)[0])
    prob = float(state["classifier"].predict_proba(X)[0][1])

    if prob >= 0.65:
        interp = f"High confidence this product will be well-rated ({prob*100:.0f}% probability)."
    elif prob >= 0.45:
        interp = f"Uncertain — moderate probability of high rating ({prob*100:.0f}%)."
    else:
        interp = f"This configuration has a low probability of a high rating ({prob*100:.0f}%)."

    top_factors = [
        FeatureImportance(**f)
        for f in (state.get("classifier_meta", {}).get("feature_importances") or [])[:5]
    ]

    return RatingPrediction(
        high_rating_prediction=pred,
        high_rating_probability=round(prob, 4),
        interpretation=interp,
        top_factors=top_factors,
    )


@app.post("/predict/price", response_model=PricePrediction)
def predict_price(product: ProductInput):
    if "regressor" not in state:
        raise HTTPException(503, "Regressor not loaded. Run training scripts first.")

    df  = _product_input_to_df(product)
    X   = df[REGRESSION_FEATURES_NO_RATING]
    predicted = float(max(1.0, state["regressor"].predict(X)[0]))
    segment   = price_segment(predicted)
    cat_avg   = _get_category_avg_price(product.Category)

    if cat_avg:
        ratio = predicted / cat_avg
        if ratio > 1.15:
            interp = f"Predicted at ${predicted:.2f} — above the {product.Category} average (${cat_avg:.2f}). Premium positioning."
        elif ratio < 0.85:
            interp = f"Predicted at ${predicted:.2f} — below the {product.Category} average (${cat_avg:.2f}). Budget/accessible positioning."
        else:
            interp = f"Predicted at ${predicted:.2f} — in line with the {product.Category} average (${cat_avg:.2f})."
    else:
        interp = f"Predicted price: ${predicted:.2f} ({segment} segment)."

    top_factors = [
        FeatureImportance(**f)
        for f in (state.get("regressor_meta", {}).get("feature_importances") or [])[:5]
    ]

    return PricePrediction(
        predicted_price_usd=round(predicted, 2),
        price_segment=segment,
        category_average_price=round(cat_avg, 2) if cat_avg else None,
        interpretation=interp,
        top_factors=top_factors,
    )


@app.post("/predict/both", response_model=BothPrediction)
def predict_both(product: ProductInput):
    rating_result = predict_rating(product)
    price_result  = predict_price(product)
    recommendation = _make_recommendation(
        rating_result.high_rating_probability,
        price_result.predicted_price_usd,
        product.Category,
    )
    return BothPrediction(
        rating=rating_result,
        price=price_result,
        recommendation=recommendation,
    )


# ---------------------------------------------------------------------------
# Portfolio Optimizer — helpers
# ---------------------------------------------------------------------------

def _portfolio_score(row, strategy: str, max_price: float, avg_price: float) -> float:
    adj   = float(row["adjusted_rating"])
    price = float(row["Price_USD"])
    if strategy == "maximize_rating":
        return adj
    if strategy == "maximize_value":
        return adj * (avg_price / price) if price > 0 else adj
    adj_norm   = (adj - 1) / 4.0
    price_norm = price / max_price
    if strategy == "premium":
        return 0.60 * adj_norm + 0.40 * price_norm
    if strategy == "budget_friendly":
        return 0.60 * adj_norm + 0.40 * (1.0 - price_norm)
    return adj


def _select_portfolio(candidates_by_cat: dict, budget: float):
    """
    Greedy selection: one product per category within budget.
    Returns (allocations_dict, budget_exceeded, min_feasible_cost).
    """
    cats = [c for c, prods in candidates_by_cat.items() if prods]
    if not cats:
        return {}, False, 0.0

    min_feasible = sum(min(p["price_usd"] for p in candidates_by_cat[c]) for c in cats)

    # Start with the highest-scored product per category
    selected = {c: 0 for c in cats}

    def total_cost():
        return sum(candidates_by_cat[c][selected[c]]["price_usd"] for c in cats)

    # Iteratively downgrade: find the switch that saves the most per unit of score loss
    for _ in range(300):
        if total_cost() <= budget:
            break
        best_ratio, best_cat, best_idx = None, None, None
        for c in cats:
            prods   = candidates_by_cat[c]
            cur_idx = selected[c]
            cur     = prods[cur_idx]
            for ni, cand in enumerate(prods):
                if ni == cur_idx:
                    continue
                savings = cur["price_usd"] - cand["price_usd"]
                if savings <= 0.01:
                    continue
                score_loss = cur["portfolio_score"] - cand["portfolio_score"]
                ratio = score_loss / savings
                if best_ratio is None or ratio < best_ratio:
                    best_ratio, best_cat, best_idx = ratio, c, ni
        if best_cat is None:
            break
        selected[best_cat] = best_idx

    result = {}
    for c in cats:
        idx = selected[c]
        result[c] = {
            "selected":     candidates_by_cat[c][idx],
            "alternatives": [p for i, p in enumerate(candidates_by_cat[c]) if i != idx][:3],
        }
    return result, total_cost() > budget, min_feasible


def _why_selected(product: dict, strategy: str, cat: str) -> str:
    adj   = product["adjusted_rating"]
    price = product["price_usd"]
    score = product["portfolio_score"]
    reasons = {
        "maximize_rating":  f"Highest adjusted rating ({adj:.2f}/5.0) among {cat} candidates.",
        "maximize_value":   f"Best value score ({score:.2f}) — strong adjusted rating ({adj:.2f}) relative to its ${price:.0f} price.",
        "premium":          f"Premium positioning: adjusted rating {adj:.2f}/5.0 at ${price:.0f}, scoring {score:.2f} on the premium scale.",
        "budget_friendly":  f"Most cost-effective {cat} at ${price:.0f} with an adjusted rating of {adj:.2f}/5.0.",
    }
    return reasons.get(strategy, f"Selected by portfolio optimizer score ({score:.2f}) for {cat}.")


def _interpret_portfolio(strategy: str, score: float, total: float, budget: float, n: int) -> str:
    desc = {
        "maximize_rating":  f"optimized for consumer satisfaction, selecting the highest Bayesian-adjusted ratings across {n} categories",
        "maximize_value":   f"built around quality-per-dollar efficiency, selecting the best adjusted rating per price across {n} categories",
        "premium":          f"positioned at the upper market tier, combining strong ratings with higher price points across {n} categories",
        "budget_friendly":  f"designed for accessible price positioning, pairing solid ratings with lower price points across {n} categories",
    }.get(strategy, f"built across {n} categories")

    if score >= 3.8:
        score_note = f"The portfolio's average adjusted rating of {score:.2f}/5.0 signals strong consumer appeal."
    elif score >= 3.0:
        score_note = f"The portfolio's average adjusted rating of {score:.2f}/5.0 is adequate for most positioning scenarios."
    else:
        score_note = f"The portfolio's average adjusted rating of {score:.2f}/5.0 is below average — consider relaxing filters."

    util = (total / budget * 100) if budget > 0 else 0
    if util <= 70:
        budget_note = f"Budget utilisation is {util:.0f}% — headroom remains to add categories or upgrade selections."
    elif util >= 96:
        budget_note = f"Budget is tightly allocated ({util:.0f}% utilised)."
    else:
        budget_note = f"Budget utilisation is {util:.0f}%, leaving moderate room for adjustments."

    return f"This portfolio is {desc}. {score_note} {budget_note}"


# ---------------------------------------------------------------------------
# Portfolio Optimizer — endpoints
# ---------------------------------------------------------------------------

@app.get("/recommend/options")
def recommend_options():
    if "portfolio_options" not in state:
        raise HTTPException(503, "Dataset not loaded.")
    return state["portfolio_options"]


@app.post("/recommend/portfolio", response_model=PortfolioResponse)
def recommend_portfolio(req: PortfolioRequest):
    if "df" not in state:
        raise HTTPException(503, "Dataset not loaded. Run training scripts first.")

    if not req.categories:
        raise HTTPException(400, "Select at least one category.")

    df       = state["df"]
    warnings = []

    # Apply filters
    mask = df["Category"].isin(req.categories)
    if req.skin_type:
        mask &= df["Skin_Type"] == req.skin_type
    if req.gender_target:
        mask &= df["Gender_Target"] == req.gender_target
    if req.cruelty_free_only:
        mask &= df["Cruelty_Free"] == True  # noqa: E712
    if req.main_ingredient:
        mask &= df["Main_Ingredient"] == req.main_ingredient
    if req.country_of_origin:
        mask &= df["Country_of_Origin"] == req.country_of_origin

    filtered = df[mask].copy()

    missing_cats = set(req.categories) - set(filtered["Category"].unique())
    if missing_cats:
        warnings.append(
            f"No products match your filters in: {', '.join(sorted(missing_cats))}. "
            "Consider relaxing filters for these categories."
        )

    if filtered.empty:
        raise HTTPException(400, "No products match the selected filters. Please broaden your criteria.")

    max_price  = state["global_max_price"]
    avg_price  = float(filtered["Price_USD"].mean())

    # Minimum feasible budget (cheapest available per category)
    min_feasible = sum(
        float(filtered[filtered["Category"] == c]["Price_USD"].min())
        for c in req.categories
        if c in filtered["Category"].values
    )

    # Score and collect candidates
    filtered["portfolio_score"] = filtered.apply(
        lambda r: _portfolio_score(r, req.strategy, max_price, avg_price), axis=1
    )

    candidates_by_cat: dict = {}
    for cat in req.categories:
        cat_df = filtered[filtered["Category"] == cat].sort_values("portfolio_score", ascending=False).head(15)
        if cat_df.empty:
            continue
        candidates_by_cat[cat] = [
            {
                "product_name":      str(r["Product_Name"]),
                "brand":             str(r["Brand"]),
                "category":          cat,
                "price_usd":         round(float(r["Price_USD"]), 2),
                "rating":            round(float(r["Rating"]), 2),
                "number_of_reviews": int(r["Number_of_Reviews"]),
                "adjusted_rating":   round(float(r["adjusted_rating"]), 3),
                "portfolio_score":   round(float(r["portfolio_score"]), 4),
                "cruelty_free":      bool(r["Cruelty_Free"]),
                "skin_type":         str(r["Skin_Type"]),
                "main_ingredient":   str(r["Main_Ingredient"]),
                "country_of_origin": str(r["Country_of_Origin"]),
            }
            for _, r in cat_df.iterrows()
        ]

    allocations, budget_exceeded, _ = _select_portfolio(candidates_by_cat, req.budget)

    if budget_exceeded:
        warnings.append(
            f"All selected categories cannot be covered within ${req.budget:,.0f}. "
            f"Minimum feasible budget for this combination is ~${min_feasible:,.0f}. "
            "Showing the most affordable configuration available."
        )

    total_value   = sum(a["selected"]["price_usd"] for a in allocations.values())
    remaining     = req.budget - total_value
    adj_ratings   = [a["selected"]["adjusted_rating"] for a in allocations.values()]
    port_score    = round(sum(adj_ratings) / len(adj_ratings), 3) if adj_ratings else 0.0

    strategy_labels = {
        "maximize_rating":  "Maximize Rating Potential",
        "maximize_value":   "Maximize Value-for-Price",
        "premium":          "Build Premium Portfolio",
        "budget_friendly":  "Build Budget-Friendly Portfolio",
    }

    cat_order = {c: i for i, c in enumerate(req.categories)}
    response_allocations = sorted(
        [
            CategoryAllocation(
                category=cat,
                selected=PortfolioProduct(**alloc["selected"]),
                alternatives=[PortfolioProduct(**p) for p in alloc["alternatives"]],
                why_selected=_why_selected(alloc["selected"], req.strategy, cat),
            )
            for cat, alloc in allocations.items()
        ],
        key=lambda a: cat_order.get(a.category, 99),
    )

    return PortfolioResponse(
        strategy=req.strategy,
        strategy_label=strategy_labels.get(req.strategy, req.strategy),
        budget=req.budget,
        allocations=response_allocations,
        total_value=round(total_value, 2),
        remaining_budget=round(remaining, 2),
        portfolio_score=port_score,
        interpretation=_interpret_portfolio(req.strategy, port_score, total_value, req.budget, len(allocations)),
        warnings=warnings,
        budget_sufficient=not budget_exceeded,
        min_feasible_budget=round(min_feasible, 2),
    )
