"""Utility helpers shared across the project."""
import json
import joblib
from pathlib import Path


def save_json(obj: dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(obj, f, indent=2, default=_json_default)


def load_json(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)


def save_model(model, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)


def load_model(path: Path):
    return joblib.load(path)


def _json_default(obj):
    """Handle numpy / pandas types during JSON serialisation."""
    import numpy as np
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Object of type {type(obj)} is not JSON serialisable")


def price_segment(price: float) -> str:
    from src.config import PRICE_SEGMENTS
    for label, threshold in PRICE_SEGMENTS.items():
        if price < threshold:
            return label
    return "Premium"
