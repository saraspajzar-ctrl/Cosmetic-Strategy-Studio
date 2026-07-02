"""Feature importance extraction for explanation in the app."""
import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance


def get_tree_feature_importances(pipeline, feature_names: list, n: int = 15) -> list:
    """Extract Gini/gain importances from tree-based models inside a pipeline."""
    step_name = list(pipeline.named_steps.keys())[-1]  # classifier or regressor
    model = pipeline.named_steps[step_name]

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        # feature_names after OHE may be longer than importances for some models
        n_feats = min(len(feature_names), len(importances))
        pairs = sorted(
            zip(feature_names[:n_feats], importances[:n_feats]),
            key=lambda x: x[1],
            reverse=True,
        )
        return [{"feature": f, "importance": round(float(v), 6)} for f, v in pairs[:n]]
    return []


def get_coef_importances(pipeline, feature_names: list, n: int = 15) -> list:
    """Extract |coefficients| from linear models."""
    step_name = list(pipeline.named_steps.keys())[-1]
    model = pipeline.named_steps[step_name]

    if hasattr(model, "coef_"):
        coefs = np.abs(model.coef_.flatten())
        n_feats = min(len(feature_names), len(coefs))
        pairs = sorted(
            zip(feature_names[:n_feats], coefs[:n_feats]),
            key=lambda x: x[1],
            reverse=True,
        )
        return [{"feature": f, "importance": round(float(v), 6)} for f, v in pairs[:n]]
    return []


def get_feature_importances(pipeline, feature_names: list, n: int = 15) -> list:
    """Unified entry point: tries tree importances first, then coefficients."""
    result = get_tree_feature_importances(pipeline, feature_names, n)
    if result:
        return result
    result = get_coef_importances(pipeline, feature_names, n)
    return result
