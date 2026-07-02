"""
Train classification model ladder to predict High_Rating.

Run:
    python src/train_classification.py

Outputs saved to models/:
    classifier_best.joblib
    classifier_metadata.json
    leaderboard_classification.json
    data_summary.json
"""
import sys
import numpy as np
import pandas as pd
from pathlib import Path

# Allow running from repo root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sklearn.model_selection import (
    train_test_split, StratifiedKFold, cross_val_score,
    RandomizedSearchCV, learning_curve,
)
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from src.config import (
    MODELS_DIR, RANDOM_STATE, CLASSIFICATION_FEATURES,
)
from src.data import load_raw_data, clean_data, get_data_summary
from src.features import engineer_features, make_classification_pipeline, get_feature_names_from_pipeline
from src.evaluate import evaluate_classifier
from src.explain import get_feature_importances
from src.utils import save_model, save_json


def run():
    print("=== Classification Training ===")

    # 1. Load and prepare data
    print("Loading and cleaning data...")
    df_raw = load_raw_data()
    df = clean_data(df_raw)
    df = engineer_features(df)

    # Save data summary (shared between classification and regression)
    summary = get_data_summary(df)
    save_json(summary, MODELS_DIR / "data_summary.json")
    print(f"  Data: {len(df)} rows, {df['High_Rating'].mean()*100:.1f}% high-rated")

    # 2. Prepare X and y
    X = df[CLASSIFICATION_FEATURES]
    y = df["High_Rating"]

    # Stratified 70/15/15 split
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=0.15, stratify=y, random_state=RANDOM_STATE
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=0.1765, stratify=y_temp, random_state=RANDOM_STATE
    )  # 0.1765 * 0.85 ≈ 0.15
    print(f"  Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    # 3. Model ladder
    # class_weight='balanced' on LogisticRegression compensates for the 73/27
    # class imbalance, preventing the model from always predicting class 0.
    models = [
        ("DummyClassifier",       DummyClassifier(strategy="most_frequent", random_state=RANDOM_STATE), True),
        ("LogisticRegression",    LogisticRegression(max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE), True),
        ("DecisionTree",          DecisionTreeClassifier(random_state=RANDOM_STATE), False),
        ("DecisionTree_depth5",   DecisionTreeClassifier(max_depth=5, random_state=RANDOM_STATE), False),
        ("RandomForest",          RandomForestClassifier(n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1), False),
        ("XGBoost",               XGBClassifier(
                                      n_estimators=300, max_depth=5, learning_rate=0.05,
                                      subsample=0.8, colsample_bytree=0.8,
                                      eval_metric="logloss", random_state=RANDOM_STATE,
                                      verbosity=0,
                                  ), False),
    ]

    leaderboard = []
    best_cv_roc = -np.inf
    best_model_name = None
    best_pipeline = None

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    for name, clf, scale in models:
        print(f"  Training {name}...")
        pipeline = make_classification_pipeline(clf, scale=scale)
        pipeline.fit(X_train, y_train)

        train_metrics = evaluate_classifier(pipeline, X_train, y_train)
        val_metrics   = evaluate_classifier(pipeline, X_val, y_val)
        test_metrics  = evaluate_classifier(pipeline, X_test, y_test)

        cv_roc = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="roc_auc", n_jobs=-1)

        row = {
            "model": name,
            "train_roc_auc": train_metrics.get("roc_auc", None),
            "val_roc_auc":   val_metrics.get("roc_auc", None),
            "test_roc_auc":  test_metrics.get("roc_auc", None),
            "test_accuracy": test_metrics["accuracy"],
            "test_f1":       test_metrics["f1"],
            "test_precision":test_metrics["precision"],
            "test_recall":   test_metrics["recall"],
            "cv_roc_mean":   round(float(cv_roc.mean()), 4),
            "cv_roc_std":    round(float(cv_roc.std()), 4),
            "overfit_gap":   round(float((train_metrics.get("roc_auc", 0) or 0) - (val_metrics.get("roc_auc", 0) or 0)), 4),
        }
        leaderboard.append(row)

        # Select by cross-validation score to avoid using the test set for model selection.
        if row["cv_roc_mean"] > best_cv_roc:
            best_cv_roc = row["cv_roc_mean"]
            best_model_name = name
            best_pipeline = pipeline

        print(f"    test ROC-AUC={test_metrics.get('roc_auc','N/A')}, F1={test_metrics['f1']}, cv={row['cv_roc_mean']:.4f}")

    # 4. Hyperparameter tuning — RandomizedSearchCV for XGBoost
    print("\n  Tuning XGBoost with RandomizedSearchCV (n_iter=20)...")
    base_xgb = XGBClassifier(eval_metric="logloss", random_state=RANDOM_STATE, verbosity=0)
    xgb_pipeline = make_classification_pipeline(base_xgb, scale=False)

    param_dist = {
        "classifier__n_estimators":     [100, 200, 300, 500],
        "classifier__max_depth":        [3, 4, 5, 6],
        "classifier__learning_rate":    [0.01, 0.05, 0.1, 0.15],
        "classifier__subsample":        [0.7, 0.8, 0.9, 1.0],
        "classifier__colsample_bytree": [0.7, 0.8, 0.9, 1.0],
        "classifier__min_child_weight": [1, 3, 5],
    }

    search = RandomizedSearchCV(
        xgb_pipeline, param_dist, n_iter=20, cv=cv,
        scoring="roc_auc", random_state=RANDOM_STATE, n_jobs=-1, verbose=0,
    )
    search.fit(X_train, y_train)

    tuned_pipeline = search.best_estimator_
    best_params = {k.replace("classifier__", ""): v for k, v in search.best_params_.items()}
    print(f"    Best params: {best_params}")

    train_m_t = evaluate_classifier(tuned_pipeline, X_train, y_train)
    val_m_t   = evaluate_classifier(tuned_pipeline, X_val,   y_val)
    test_m_t  = evaluate_classifier(tuned_pipeline, X_test,  y_test)

    row_tuned = {
        "model": "XGBoost_Tuned",
        "train_roc_auc": train_m_t.get("roc_auc"),
        "val_roc_auc":   val_m_t.get("roc_auc"),
        "test_roc_auc":  test_m_t.get("roc_auc"),
        "test_accuracy": test_m_t["accuracy"],
        "test_f1":       test_m_t["f1"],
        "test_precision":test_m_t["precision"],
        "test_recall":   test_m_t["recall"],
        "cv_roc_mean":   round(float(search.best_score_), 4),
        "cv_roc_std":    round(float(search.cv_results_["std_test_score"][search.best_index_]), 4),
        "overfit_gap":   round(float((train_m_t.get("roc_auc", 0) or 0) - (val_m_t.get("roc_auc", 0) or 0)), 4),
        "best_params":   best_params,
    }
    leaderboard.append(row_tuned)

    if row_tuned["cv_roc_mean"] > best_cv_roc:
        best_cv_roc = row_tuned["cv_roc_mean"]
        best_model_name = "XGBoost_Tuned"
        best_pipeline = tuned_pipeline

    print(f"    test ROC-AUC={test_m_t.get('roc_auc','N/A')}, F1={test_m_t['f1']}, cv={row_tuned['cv_roc_mean']:.4f}")

    # 5. Learning curve for the best model
    print(f"\n  Computing learning curve for {best_model_name}...")
    train_sizes, lc_train, lc_val = learning_curve(
        best_pipeline, X_train, y_train,
        cv=cv, scoring="roc_auc",
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

    # 6. Feature importances for best model
    feature_names = get_feature_names_from_pipeline(best_pipeline, task="classification")
    importances = get_feature_importances(best_pipeline, feature_names, n=20)

    # 7. Save artefacts
    print(f"\n  Best model: {best_model_name} (cv ROC-AUC={best_cv_roc:.4f})")
    save_model(best_pipeline, MODELS_DIR / "classifier_best.joblib")
    save_json(leaderboard, MODELS_DIR / "leaderboard_classification.json")

    best_row = next(r for r in leaderboard if r["model"] == best_model_name)
    metadata = {
        "task": "classification",
        "target": "High_Rating",
        "threshold": 4.0,
        "best_model": best_model_name,
        "features": CLASSIFICATION_FEATURES,
        "metrics": best_row,
        "feature_importances": importances,
        "learning_curve": learning_curve_data,
        "train_size": len(X_train),
        "val_size": len(X_val),
        "test_size": len(X_test),
    }
    save_json(metadata, MODELS_DIR / "classifier_metadata.json")

    print("  Saved classifier_best.joblib, classifier_metadata.json, leaderboard_classification.json")
    print("=== Classification Training Complete ===\n")


if __name__ == "__main__":
    run()
