# Cosmetic Strategy Studio

An end-to-end machine learning project built for the subject **Modelling in Advanced Data Analytics (MADA)**.

The app helps cosmetics brand managers evaluate new product configurations — predicting price point, probability of a high rating, and building optimised product portfolios across a budget.

---

## Live App

| Resource | URL |
|----------|-----|
| Live App | https://cosmetic-strategy-studio.vercel.app |
| Backend API | https://cosmetic-strategy-studio.onrender.com |
| API Docs | https://cosmetic-strategy-studio.onrender.com/docs |

> **Note**: The backend runs on Render's free tier and may take 30–60 seconds to wake from cold start on first prediction request. Static data (model leaderboard, commercial insights) loads instantly from Vercel's CDN.

---

## Dataset

**Source**: [Most Used Beauty & Cosmetics Products (Extended)](https://www.kaggle.com/) — public Kaggle dataset  
**Location**: `data/raw/most_used_beauty_cosmetics_products_extended.csv`  
**Size**: 15,000 rows × 14 columns

> **Finding**: This dataset is synthetically generated. All numeric variables have near-zero correlations (< 0.01). The ML models perform near the random baseline (ROC-AUC 0.526 for classification, R² ≈ 0 for regression). This is documented honestly in the analysis report and executive summary. The pipeline architecture is correct and would work with real market data.

---

## Modelling Questions

1. **Classification** — Can we predict whether a product will be highly rated?
   - Target: `High_Rating = 1` if `Rating ≥ 4.0`, else `0`
   - No Rating is used as input (would be data leakage)

2. **Regression** — Can we predict the retail price (Price_USD)?
   - Target: `Price_USD`
   - Main model: no Rating feature (realistic for a new product)

---

## App Features

| Tab | What it does |
|-----|--------------|
| Welcome | Dataset overview, key stats |
| Product Success Predictor | Predicts high-rating probability for a custom product config |
| Price Predictor | Predicts expected retail price |
| Commercial Insights | Category benchmarks, feature importances, price segments |
| Portfolio Optimizer | Bayesian-scored portfolio builder across a budget |
| Model Performance | Leaderboard, feature drivers, honest limitations |

---

## Architecture

```
data/raw/CSV
    │
    ▼
src/ (offline training)
  data.py → clean_data()
  features.py → engineer_features() + Pipeline builders
  train_classification.py → saves classifier_best.joblib
  train_regression.py → saves regressor_best.joblib
    │
    ▼
models/ (joblib + JSON artefacts)
    │
    ├──► frontend/public/data/          ← static JSON, served by Vercel CDN
    │      leaderboard.json
    │      metadata.json
    │      data_summary.json
    │
    ▼
backend/main.py (FastAPI on Render)
  GET  /health
  POST /predict/rating
  POST /predict/price
  POST /predict/both
  GET  /recommend/options
  POST /recommend/portfolio
    │
    ▼
frontend/ (React + Vite on Vercel)
  6 tabs — static data from CDN, predictions from Render
```

---

## Installation

### Python

```bash
cd beauty-cosmetics-ml-app
pip install -r requirements.txt
```

Requires Python 3.10+. On macOS, XGBoost requires OpenMP:

```bash
brew install libomp
```

### Node (Frontend)

```bash
cd frontend
npm install
```

---

## Running Locally

### 1. Train models

```bash
python src/train_classification.py
python src/train_regression.py
```

Outputs saved to `models/`.

### 2. Run backend

```bash
uvicorn backend.main:app --reload
```

API available at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

### 3. Run frontend

```bash
cd frontend
npm run dev
```

App available at `http://localhost:5173`. The frontend proxies `/api/*` to `http://localhost:8000` in dev mode via `vite.config.js`.

### 4. Build frontend for production

```bash
cd frontend
npm run build
```

---

## Render the Analysis Report

The Quarto document runs end-to-end from a clean checkout and produces the full Phase-2 HTML analysis.

### Prerequisites

```bash
# Install Python dependencies (if not already done)
pip install -r requirements.txt

# Install Quarto: https://quarto.org/docs/get-started/
# On macOS:
brew install quarto
```

### Render

```bash
quarto render reports/analysis.qmd
```

Output: `reports/analysis.html` — open in any browser.

---

## Deployment

### Frontend → Vercel

1. Push repo to GitHub.
2. Connect on [vercel.com](https://vercel.com).
3. Set **Root Directory** to `frontend/`.
4. Build command: `npm run build`, publish directory: `dist`.
5. No environment variables needed — the production backend URL is baked in at build time.

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repo, set root to `/`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
5. Ensure `models/*.joblib` and `models/*.json` are committed to the repo.

---

## Folder Structure

```
beauty-cosmetics-ml-app/
├── README.md
├── requirements.txt
├── .gitignore
├── data/
│   ├── raw/                        ← dataset CSV
│   └── processed/
├── src/
│   ├── config.py
│   ├── data.py
│   ├── features.py
│   ├── train_classification.py
│   ├── train_regression.py
│   ├── evaluate.py
│   ├── explain.py
│   └── utils.py
├── models/                         ← saved pipelines + JSON metadata
├── backend/
│   └── main.py                     ← FastAPI app
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   └── data/                   ← static JSON served by Vercel CDN
│   │       ├── leaderboard.json
│   │       ├── metadata.json
│   │       └── data_summary.json
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── styles.css
│       ├── featureLabels.js
│       ├── categoryImages.jsx
│       └── components/
│           ├── Tabs.jsx
│           ├── WelcomeTab.jsx
│           ├── ProductSuccessTab.jsx
│           ├── PricePredictorTab.jsx
│           ├── CommercialInsightsTab.jsx
│           ├── PortfolioOptimizerTab.jsx
│           ├── ModelPerformanceTab.jsx
│           ├── LeaderboardTable.jsx
│           ├── ChartCard.jsx
│           ├── ProductForm.jsx
│           ├── PredictionCards.jsx
│           ├── ProductConceptPreview.jsx
│           └── SavedProductsBar.jsx
└── reports/
    ├── analysis.qmd                ← Quarto source
    ├── analysis.html               ← rendered output
    ├── executive_summary.md
    └── ai_workflow_reflection.md
```

---

## Reproducibility

All scripts use `random_state=42`. Running `train_classification.py` then `train_regression.py` from a clean checkout will reproduce all model files and JSON metadata identically.

---

## AI Workflow Note

This project was built with Claude Code (claude-sonnet-4-6) as a senior ML engineering assistant. See `reports/ai_workflow_reflection.md` for details on how the AI was used, what was verified manually, and the rough cost/effort breakdown.
