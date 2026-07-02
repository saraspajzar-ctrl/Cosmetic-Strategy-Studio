"""Pydantic request / response schemas."""
from typing import Optional, List
from pydantic import BaseModel, Field


class ProductInput(BaseModel):
    Brand: str = Field(..., example="Drunk Elephant")
    Category: str = Field(..., example="Serum")
    Usage_Frequency: str = Field(..., example="Daily")
    Number_of_Reviews: float = Field(..., ge=0, example=500)
    Product_Size: str = Field(..., example="50ml")
    Skin_Type: str = Field(..., example="Normal")
    Gender_Target: str = Field(..., example="Unisex")
    Packaging_Type: str = Field(..., example="Bottle")
    Main_Ingredient: str = Field(..., example="Hyaluronic Acid")
    Cruelty_Free: str = Field(..., example="True")
    Country_of_Origin: str = Field(..., example="USA")
    Rating: Optional[float] = Field(None, ge=1.0, le=5.0, description="Optional — only used in alternative price model")


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class RatingPrediction(BaseModel):
    high_rating_prediction: int
    high_rating_probability: float
    interpretation: str
    top_factors: List[FeatureImportance]


class PricePrediction(BaseModel):
    predicted_price_usd: float
    price_segment: str
    category_average_price: Optional[float]
    interpretation: str
    top_factors: List[FeatureImportance]


class BothPrediction(BaseModel):
    rating: RatingPrediction
    price: PricePrediction
    recommendation: str


# ---------------------------------------------------------------------------
# Portfolio Optimizer schemas
# ---------------------------------------------------------------------------

class PortfolioRequest(BaseModel):
    budget: float = Field(..., gt=0, description="Total portfolio budget or target retail value in USD")
    categories: List[str]
    strategy: str = Field("maximize_rating", description="maximize_rating | maximize_value | premium | budget_friendly")
    skin_type: Optional[str] = None
    gender_target: Optional[str] = None
    cruelty_free_only: bool = False
    main_ingredient: Optional[str] = None
    country_of_origin: Optional[str] = None


class PortfolioProduct(BaseModel):
    product_name: str
    brand: str
    category: str
    price_usd: float
    rating: float
    number_of_reviews: int
    adjusted_rating: float
    portfolio_score: float
    cruelty_free: bool
    skin_type: str
    main_ingredient: str
    country_of_origin: str


class CategoryAllocation(BaseModel):
    category: str
    selected: PortfolioProduct
    alternatives: List[PortfolioProduct]
    why_selected: str = ""


class PortfolioResponse(BaseModel):
    strategy: str
    strategy_label: str
    budget: float
    allocations: List[CategoryAllocation]
    total_value: float
    remaining_budget: float
    portfolio_score: float
    interpretation: str
    warnings: List[str]
    budget_sufficient: bool
    min_feasible_budget: float
