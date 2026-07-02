# Executive Summary — Beauty Product Intelligence App

## What Question Was Studied

This project explored two questions using a dataset of 15,000 cosmetics products:

1. **Can we predict whether a product will be highly rated** (rating ≥ 4.0 out of 5)?
2. **Can we predict the retail price** of a cosmetics product in USD based on its product attributes?

The goal was to build a practical tool that cosmetics brand managers or product developers could use to evaluate a new product concept before launch.

## What Data Was Used

The project used the "Most Used Beauty & Cosmetics Products (Extended)" dataset (public, Kaggle). It contains 15,000 product records with attributes including brand, category, usage frequency, size, skin type, packaging, main ingredient, cruelty-free status, and country of origin.

## Main Findings

The analysis found that this dataset does not contain meaningful predictive relationships. All numeric variables (price, rating, and review count) have near-zero correlations with each other. Every brand and category appears at nearly identical average price points (~$80), and ratings are uniformly distributed from 1 to 5 regardless of product type or ingredient.

This strongly suggests the dataset is synthetically generated — it simulates the look of a real cosmetics dataset but was constructed with random values. As a result, the machine learning models perform near the random baseline: the best classification model achieves a ROC-AUC of 0.53 (random chance = 0.50), and the regression models cannot explain price variance (R² ≈ 0).

This is an honest finding: data quality and realism are prerequisites for useful machine learning. The project demonstrates that a sophisticated pipeline correctly identifies when there is nothing learnable in the data.

## What the App Does

The app provides a product configuration form where a user selects brand, category, ingredients, packaging, and other attributes. The system returns a predicted price and a probability of receiving a high rating. It also shows a model performance leaderboard, dataset summary statistics, and a simple recommendation based on how the product compares to category averages. The full architecture — data pipeline, scikit-learn/XGBoost models, FastAPI backend, React frontend — is production-ready and would work correctly with real market data.

## Business Recommendation

If a cosmetics brand wanted to use a tool like this for real decisions, the first step would be to obtain actual market data — ideally with prices reflecting genuine brand tier differences, ratings derived from verified consumer reviews, and product attributes that meaningfully vary by category. The ML pipeline built in this project is structurally sound and would produce actionable predictions with a better dataset.

## Limitations

- The dataset appears to be synthetic with randomly assigned values — no real market signal exists.
- Models perform at or near the baseline for both classification and regression.
- Brand reputation, seasonal trends, marketing spend, and retailer channel are not captured in the data.
- The app is a decision-support tool, not a market prediction guarantee. Even with real data, predictions would carry uncertainty.
