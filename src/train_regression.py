"""
Train regression model ladder to predict Price_USD.

Run:
    python src/train_regression.py

Outputs saved to models/:
    regressor_best.joblib
    regressor_metadata.json
    leaderboard_regression.json
"""
import sys
import numpy as np
import pandas as pd
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sklearn.model_selection import (
    train_test_split, KFold, cross_val_score,
    RandomizedSearchCV, learning_curve,
)
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

from src.config import (
    MODELS_DIR, RANDOM_STATE,
    REGRESSION_FEATURES_NO_RATING, REGRESSION_FEATURES_WITH_RATING,
)
from src.data import load_raw_data, clean_data
from src.features import engineer_features, make_regression_pipeline, get_feature_names_from_pipeline
from src.evaluate import evaluate_regressor
from src.explain import get_feature_importances
from src.utils import save_model, save_json


def run():
    print("=== Regression Training ===")

    # 1. Data
    print("Loading and cleaning data...")
    df_raw = load_raw_data()
    df = clean_data(df_raw)
    df = engineer_features(df)

    y = df["Price_USD"]
    X_no_rating   = df[REGRESSION_FEATURES_NO_RATING]
    X_with_rating = df[REGRESSION_FEATURES_WITH_RATING]

    X_train_nr, X_test_nr, y_train, y_test = train_test_split(
        X_no_rating, y, test_size=0.15, random_state=RANDOM_STATE
    )
    X_train_wr, X_test_wr, _, _ = train_test_split(
        X_with_rating, y, test_size=0.15, random_state=RANDOM_STATE
    )
    print(f"  Train: {len(X_train_nr)}, Test: {len(X_test_nr)}")

    # 2. Model ladder (without Rating — main realistic model)
    models = [
        ("DummyRegressor",      DummyRegressor(strategy="mean"), True),
        ("Ridge",               Ridge(alpha=10.0, random_state=RANDOM_STATE), True),
        ("DecisionTree",        DecisionTreeRegressor(random_state=RANDOM_STATE), False),
        ("DecisionTree_depth6", DecisionTreeRegressor(max_depth=6, random_state=RANDOM_STATE), False),
        ("RandomForest",        RandomForestRegressor(n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1), False),
        ("XGBoost",             XGBRegressor(
                                    n_estimators=300, max_depth=5, learning_rate=0.05,
                                    subsample=0.8, colsample_bytree=0.8,
                                    random_state=RANDOM_STATE, verbosity=0,
                                ), False),
    ]

    cv = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    leaderboard = []
    best_cv_r2 = -np.inf
    best_model_name = None
    best_pipeline = None

    for name, reg, scale in models:
        print(f"  Training {name} (no Rating)...")
        pipeline = make_regression_pipeline(reg, include_rating=False, scale=scale)
        pipeline.fit(X_train_nr, y_train)

        train_m = evaluate_regressor(pipeline, X_train_nr, y_train)
        test_m  = evaluate_regressor(pipeline, X_test_nr,  y_test)
        cv_r2   = cross_val_score(pipeline, X_train_nr, y_train, cv=cv, scoring="r2", n_jobs=-1)

        row = {
            "model": name,
            "variant": "no_rating",
            "train_r2":    train_m["r2"],
            "test_r2":     test_m["r2"],
            "test_mae":    test_m["mae"],
            "test_rmse":   test_m["rmse"],
            "cv_r2_mean":  round(float(cv_r2.mean()), 4),
            "cv_r2_std":   round(float(cv_r2.std()), 4),
            "overfit_gap": round(float(train_m["r2"] - test_m["r2"]), 4),
        }
        leaderboard.append(row)

        # Skip DummyRegressor when selecting model to save — it produces
        # identical predictions for all inputs, which makes the app useless.
        # Select by cross-validation score to avoid using the test set for model selection.
        if name != "DummyRegressor" and row["cv_r2_mean"] > best_cv_r2:
            best_cv_r2 = row["cv_r2_mean"]
            best_model_name = name
            best_pipeline = pipeline

        print(f"    test R²={test_m['r2']}, MAE={test_m['mae']:.2f}, cv={row['cv_r2_mean']:.4f}")

    # 3. Also train XGBoost WITH rating (alternative model, labelled clearly)
    print("  Training XGBoost (with Rating) — alternative model...")
    xgb_wr = XGBRegressor(
        n_estimators=300, max_depth=5, learning_rate=0.05,
        subsample=0.8, colsample_bytree=0.8,
        random_state=RANDOM_STATE, verbosity=0,
    )
    pipeline_wr = make_regression_pipeline(xgb_wr, include_rating=True, scale=False)
    pipeline_wr.fit(X_train_wr, y_train)
    test_wr = evaluate_regressor(pipeline_wr, X_test_wr, y_test)
    cv_wr   = cross_val_score(pipeline_wr, X_train_wr, y_train, cv=cv, scoring="r2", n_jobs=-1)
    leaderboard.append({
        "model": "XGBoost",
        "variant": "with_rating",
        "train_r2":    evaluate_regressor(pipeline_wr, X_train_wr, y_train)["r2"],
        "test_r2":     test_wr["r2"],
        "test_mae":    test_wr["mae"],
        "test_rmse":   test_wr["rmse"],
        "cv_r2_mean":  round(float(cv_wr.mean()), 4),
        "cv_r2_std":   round(float(cv_wr.std()), 4),
        "overfit_gap": None,
    })
    print(f"    (with Rating) test R²={test_wr['r2']}, MAE={test_wr['mae']:.2f}")

    # 4. Hyperparameter tuning — RandomizedSearchCV for XGBoost
    print("\n  Tuning XGBoost with RandomizedSearchCV (n_iter=20)...")
    base_xgb = XGBRegressor(random_state=RANDOM_STATE, verbosity=0)
    xgb_pipeline = make_regression_pipeline(base_xgb, include_rating=False, scale=False)

    param_dist = {
        "regressor__n_estimators":     [100, 200, 300, 500],
        "regressor__max_depth":        [3, 4, 5, 6],
        "regressor__learning_rate":    [0.01, 0.05, 0.1, 0.15],
        "regressor__subsample":        [0.7, 0.8, 0.9, 1.0],
        "regressor__colsample_bytree": [0.7, 0.8, 0.9, 1.0],
        "regressor__min_child_weight": [1, 3, 5],
    }

    search = RandomizedSearchCV(
        xgb_pipeline, param_dist, n_iter=20, cv=cv,
        scoring="r2", random_state=RANDOM_STATE, n_jobs=-1, verbose=0,
    )
    search.fit(X_train_nr, y_train)

    tuned_pipeline = search.best_estimator_
    best_params = {k.replace("regressor__", ""): v for k, v in search.best_params_.items()}
    print(f"    Best params: {best_params}")

    train_m_t = evaluate_regressor(tuned_pipeline, X_train_nr, y_train)
    test_m_t  = evaluate_regressor(tuned_pipeline, X_test_nr,  y_test)

    row_tuned = {
        "model": "XGBoost_Tuned",
        "variant": "no_rating",
        "train_r2":    train_m_t["r2"],
        "test_r2":     test_m_t["r2"],
        "test_mae":    test_m_t["mae"],
        "test_rmse":   test_m_t["rmse"],
        "cv_r2_mean":  round(float(search.best_score_), 4),
        "cv_r2_std":   round(float(search.cv_results_["std_test_score"][search.best_index_]), 4),
        "overfit_gap": round(float(train_m_t["r2"] - test_m_t["r2"]), 4),
        "best_params": best_params,
    }
    leaderboard.append(row_tuned)

    if row_tuned["cv_r2_mean"] > best_cv_r2:
        best_cv_r2 = row_tuned["cv_r2_mean"]
        best_model_name = "XGBoost_Tuned"
        best_pipeline = tuned_pipeline

    print(f"    test R²={test_m_t['r2']}, MAE={test_m_t['mae']:.2f}, cv={row_tuned['cv_r2_mean']:.4f}")

    # 5. Learning curve for best model
    print(f"\n  Computing learning curve for {best_model_name}...")
    train_sizes, lc_train, lc_val = learning_curve(
        best_pipeline, X_train_nr, y_train,
        cv=cv, scoring="r2",
        train_sizes=np.linspace(0.1, 1.0, 8),
        n_jobs=-1,
    )
    learning_curve_data = {
        "train_sizes": train_sizes.tolist(),
        "train_mean": lc_train.mean(axis=1).tolist(),
        "val_mean": lc_val.mean(axis=1).tolist(),
        "train_std": lc_train.std(axis=1).tolist(),
        "val_std": lc_val.std(axis=1).tolist(),
    }

    # 6. Feature importances
    feature_names = get_feature_names_from_pipeline(best_pipeline, task="regression", include_rating=False)
    importances = get_feature_importances(best_pipeline, feature_names, n=20)

    # 7. Save
    print(f"\n  Best model: {best_model_name} (cv R²={best_cv_r2:.4f})")
    save_model(best_pipeline, MODELS_DIR / "regressor_best.joblib")
    save_json(leaderboard, MODELS_DIR / "leaderboard_regression.json")

    best_row = next(r for r in leaderboard if r["model"] == best_model_name and r.get("variant") == "no_rating")
    metadata = {
        "task": "regression",
        "target": "Price_USD",
        "variant": "no_rating",
        "best_model": best_model_name,
        "features": REGRESSION_FEATURES_NO_RATING,
        "metrics": best_row,
        "feature_importances": importances,
        "learning_curve": learning_curve_data,
        "train_size": len(X_train_nr),
        "test_size": len(X_test_nr),
    }
    save_json(metadata, MODELS_DIR / "regressor_metadata.json")

    print("  Saved regressor_best.joblib, regressor_metadata.json, leaderboard_regression.json")
    print("=== Regression Training Complete ===\n")


if __name__ == "__main__":
    run()
