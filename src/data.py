"""Data loading and cleaning."""
import pandas as pd
import numpy as np
from src.config import DATA_RAW_PATH


def load_raw_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_RAW_PATH)
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Normalise boolean-like strings for Cruelty_Free
    df["Cruelty_Free"] = df["Cruelty_Free"].astype(str).str.strip().str.title()
    # Keep as string category "True"/"False" for OHE

    # Strip whitespace from all string columns
    str_cols = df.select_dtypes(include="object").columns
    for col in str_cols:
        df[col] = df[col].str.strip()

    # Ensure numeric types
    df["Price_USD"] = pd.to_numeric(df["Price_USD"], errors="coerce")
    df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce")
    df["Number_of_Reviews"] = pd.to_numeric(df["Number_of_Reviews"], errors="coerce")

    # Drop rows where target columns are NaN (very few if any)
    df = df.dropna(subset=["Price_USD", "Rating"])

    return df.reset_index(drop=True)


def get_data_summary(df: pd.DataFrame) -> dict:
    """Produce a JSON-serialisable summary of the cleaned dataset."""
    numeric_cols = ["Price_USD", "Rating", "Number_of_Reviews"]
    summary = {
        "n_rows": len(df),
        "n_cols": len(df.columns),
        "columns": list(df.columns),
        "missing_values": df.isnull().sum().to_dict(),
        "numeric_stats": {},
        "category_counts": {},
    }

    for col in numeric_cols:
        if col in df.columns:
            s = df[col].describe()
            summary["numeric_stats"][col] = {
                "mean": round(float(s["mean"]), 2),
                "std": round(float(s["std"]), 2),
                "min": round(float(s["min"]), 2),
                "max": round(float(s["max"]), 2),
                "median": round(float(df[col].median()), 2),
            }

    cat_cols = ["Category", "Brand", "Skin_Type", "Gender_Target",
                "Packaging_Type", "Cruelty_Free", "Country_of_Origin"]
    for col in cat_cols:
        if col in df.columns:
            summary["category_counts"][col] = df[col].value_counts().head(20).to_dict()

    # High_Rating distribution
    high_rating = (df["Rating"] >= 4.0).astype(int)
    summary["high_rating_distribution"] = {
        "high_rated_count": int(high_rating.sum()),
        "not_high_rated_count": int((high_rating == 0).sum()),
        "high_rated_pct": round(float(high_rating.mean() * 100), 1),
    }

    # Price segment distribution
    def segment(p):
        if p < 50:
            return "Budget"
        elif p < 100:
            return "Mid-range"
        return "Premium"

    df["_segment"] = df["Price_USD"].apply(segment)
    summary["price_segment_distribution"] = df["_segment"].value_counts().to_dict()

    # Category-level averages for comparison in app
    cat_avg = df.groupby("Category")[["Price_USD", "Rating"]].mean().round(2)
    summary["category_averages"] = cat_avg.to_dict(orient="index")

    return summary
