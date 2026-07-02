"""Central configuration — paths, constants, feature lists."""
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_PATH = ROOT_DIR / "data" / "raw" / "most_used_beauty_cosmetics_products_extended.csv"
DATA_PROCESSED_DIR = ROOT_DIR / "data" / "processed"
MODELS_DIR = ROOT_DIR / "models"
REPORTS_DIR = ROOT_DIR / "reports"

RANDOM_STATE = 42
TARGET_RATING_THRESHOLD = 4.0

# Price segments (USD thresholds, upper-exclusive except Premium)
PRICE_SEGMENTS = {"Budget": 50.0, "Mid-range": 100.0, "Premium": float("inf")}

# Features for classification (no Rating, no Price_USD, no Product_Name)
CLASSIFICATION_FEATURES = [
    "Brand",
    "Category",
    "Usage_Frequency",
    "Number_of_Reviews",
    "Product_Size_ml",       # engineered
    "Review_Count_Log",      # engineered
    "Skin_Type",
    "Gender_Target",
    "Packaging_Type",
    "Main_Ingredient",
    "Cruelty_Free",
    "Country_of_Origin",
]

# Regression features WITHOUT Rating (realistic new-product scenario)
REGRESSION_FEATURES_NO_RATING = [
    "Brand",
    "Category",
    "Usage_Frequency",
    "Number_of_Reviews",
    "Product_Size_ml",
    "Review_Count_Log",
    "Skin_Type",
    "Gender_Target",
    "Packaging_Type",
    "Main_Ingredient",
    "Cruelty_Free",
    "Country_of_Origin",
]

# Regression features WITH Rating (for the alternative model)
REGRESSION_FEATURES_WITH_RATING = REGRESSION_FEATURES_NO_RATING + ["Rating"]

# Numeric vs categorical split used inside pipeline builders
NUMERIC_FEATURES = ["Number_of_Reviews", "Product_Size_ml", "Review_Count_Log"]
CATEGORICAL_FEATURES = [
    "Brand",
    "Category",
    "Usage_Frequency",
    "Skin_Type",
    "Gender_Target",
    "Packaging_Type",
    "Main_Ingredient",
    "Cruelty_Free",
    "Country_of_Origin",
]
