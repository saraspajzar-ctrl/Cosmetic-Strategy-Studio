"""Feature engineering and pipeline construction."""
import re
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

from src.config import (
    NUMERIC_FEATURES,
    CATEGORICAL_FEATURES,
    CLASSIFICATION_FEATURES,
    REGRESSION_FEATURES_NO_RATING,
    REGRESSION_FEATURES_WITH_RATING,
    TARGET_RATING_THRESHOLD,
)


# ---------------------------------------------------------------------------
# Feature engineering helpers
# ---------------------------------------------------------------------------

def parse_product_size_ml(size_str) -> float:
    """Extract numeric ml value from strings like '30ml', '100 ml', '1.5L'."""
    if pd.isna(size_str):
        return np.nan
    s = str(size_str).strip().lower()
    # Handle litres (e.g. "1.5l" or "1.5 l")
    match_l = re.search(r"([\d.]+)\s*l(?:itre)?s?(?!\w)", s)
    if match_l:
        return float(match_l.group(1)) * 1000
    match_ml = re.search(r"([\d.]+)\s*ml", s)
    if match_ml:
        return float(match_ml.group(1))
    # Fallback: try bare number
    match_num = re.search(r"([\d.]+)", s)
    if match_num:
        return float(match_num.group(1))
    return np.nan


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add all engineered columns to a copy of df."""
    df = df.copy()

    # Parse product size
    df["Product_Size_ml"] = df["Product_Size"].apply(parse_product_size_ml)

    # Log-transform review count (handles skew)
    df["Review_Count_Log"] = np.log1p(df["Number_of_Reviews"].fillna(0))

    # Classification target
    df["High_Rating"] = (df["Rating"] >= TARGET_RATING_THRESHOLD).astype(int)

    # Price segment (for EDA and app display — not a predictive feature)
    def _segment(p):
        if p < 50:
            return "Budget"
        elif p < 100:
            return "Mid-range"
        return "Premium"

    df["Price_Segment"] = df["Price_USD"].apply(_segment)

    # Value score for dashboard insights only (NOT a predictive feature — would leak)
    df["Value_Score"] = df["Rating"] / df["Price_USD"].replace(0, np.nan)

    return df


# ---------------------------------------------------------------------------
# Pipeline builders
# ---------------------------------------------------------------------------

def _numeric_transformer(scale: bool = True) -> Pipeline:
    steps = [("imputer", SimpleImputer(strategy="median"))]
    if scale:
        steps.append(("scaler", StandardScaler()))
    return Pipeline(steps)


def _categorical_transformer() -> Pipeline:
    return Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])


def _build_preprocessor(feature_list: list, scale: bool = True) -> ColumnTransformer:
    """Build a ColumnTransformer for the given feature list."""
    num_feats = [f for f in NUMERIC_FEATURES + ["Rating"] if f in feature_list]
    cat_feats = [f for f in feature_list if f not in num_feats]

    transformers = []
    if num_feats:
        transformers.append(("num", _numeric_transformer(scale=scale), num_feats))
    if cat_feats:
        transformers.append(("cat", _categorical_transformer(), cat_feats))

    return ColumnTransformer(transformers=transformers, remainder="drop")


def make_classification_pipeline(model, scale: bool = True) -> Pipeline:
    """Return a full sklearn Pipeline for the classification task."""
    preprocessor = _build_preprocessor(CLASSIFICATION_FEATURES, scale=scale)
    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", model),
    ])


def make_regression_pipeline(model, include_rating: bool = False, scale: bool = True) -> Pipeline:
    """Return a full sklearn Pipeline for the regression task."""
    features = REGRESSION_FEATURES_WITH_RATING if include_rating else REGRESSION_FEATURES_NO_RATING
    preprocessor = _build_preprocessor(features, scale=scale)
    return Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", model),
    ])


def get_feature_names_from_pipeline(pipeline: Pipeline, task: str = "classification", include_rating: bool = False) -> list:
    """Extract feature names after OHE from a fitted pipeline."""
    preprocessor = pipeline.named_steps["preprocessor"]
    if task == "classification":
        feature_list = CLASSIFICATION_FEATURES
    else:
        feature_list = REGRESSION_FEATURES_WITH_RATING if include_rating else REGRESSION_FEATURES_NO_RATING

    num_feats = [f for f in NUMERIC_FEATURES + ["Rating"] if f in feature_list]
    cat_feats = [f for f in feature_list if f not in num_feats]

    all_names = list(num_feats)
    for name, trans, cols in preprocessor.transformers_:
        if name == "cat":
            ohe = trans.named_steps["ohe"]
            all_names += list(ohe.get_feature_names_out(cols))

    return all_names
