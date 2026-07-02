# Beauty Product Intelligence App

A complete end-to-end machine learning project built for the subject **Modelling in Advanced Data Analytics (MADA)**.

The app helps cosmetics brand managers and product developers evaluate a new product configuration by predicting its likely price point and probability of receiving a high consumer rating.

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
   - **No Rating is used as input** (would be data leakage)

2. **Regression** — Can we predict the retail price (Price_USD)?  
   - Target: `Price_USD`  
   - Main model: no Rating feature (realistic for a new product)  
   - Alternative model: with Rating (labelled clearly, benchmarking only)

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
    ▼
backend/main.py (FastAPI)
  GET  /health
  GET  /metadata
  GET  /data/summary
  GET  /models/leaderboard
  POST /predict/rating
  POST /predict/price
  POST /predict/both
    │
    ▼
frontend/ (React + Vite)
  Product form → API call → Prediction cards + charts
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

## Running

### 1. Train models

```bash
# From repo root
python src/train_classification.py
python src/train_regression.py
```

Outputs saved to `models/`.

### 2. Run backend

```bash
uvicorn backend.main:app --reload
```

API available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### 3. Run frontend

```bash
cd frontend
npm run dev
```

App available at: `http://localhost:5173`

### 4. Build frontend for production

```bash
cd frontend
npm run build
```

---

## Render Reports

```bash
quarto render reports/analysis.qmd
quarto render reports/slides.qmd
```

---

## Deployment

### Frontend → Vercel or Netlify

1. Push repo to GitHub.
2. Connect on [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com).
3. Set **Root Directory** to `frontend/`.
4. Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`
5. Build command: `npm run build`, publish directory: `dist`.

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repo.
3. Set Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
4. Ensure `models/*.joblib` and `models/*.json` are committed.

### Backend → Hugging Face Spaces (alternative)

Use the `gradio` or `docker` runtime with the same `uvicorn` start command.

---

## Live Links (fill in after deployment)

| Resource | URL |
|----------|-----|
| Live App | _TBD_ |
| Backend API | _TBD_ |
| Analysis Report | _TBD_ |
| Slides | _TBD_ |

---

## Folder Structure

```
beauty-cosmetics-ml-app/
├── README.md
├── requirements.txt
├── .gitignore
├── .env.example
├── data/
│   ├── raw/   ← dataset CSV
│   └── processed/
├── notebooks/
│   └── optional_exploration.ipynb
├── reports/
│   ├── analysis.qmd
│   ├── executive_summary.md
│   ├── ai_workflow_reflection.md
│   └── slides.qmd
├── src/
│   ├── config.py
│   ├── data.py
│   ├── features.py
│   ├── train_classification.py
│   ├── train_regression.py
│   ├── evaluate.py
│   ├── explain.py
│   └── utils.py
├── models/            ← saved pipelines + JSON metadata
├── backend/
│   ├── main.py
│   ├── schemas.py
│   └── README.md
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── api.js
        ├── styles.css
        └── components/
            ├── ProductForm.jsx
            ├── PredictionCards.jsx
            ├── DashboardCharts.jsx
            ├── LeaderboardTable.jsx
            └── RecommendationBox.jsx
```

---

## Visual Assets

The frontend uses **inline SVG-based product illustrations** — no external image files are required and the app works fully offline.

### Category images

Each product category (Serum, Moisturizer, Lipstick, etc.) maps to a unique inline SVG product silhouette defined in `frontend/src/categoryImages.js`. These are abstract product illustrations in a warm, cosmetics-appropriate color palette.

- Images are **not real product photos** and do not represent any brand.
- The dataset does not include product image URLs — these are synthetic placeholder visuals.
- To replace with licensed product images, add files to `frontend/public/images/categories/{category-slug}.png` and update the `getCategoryImage()` function in `categoryImages.js`.

### Concept image upload

The Product Success Predictor and Price Predictor tabs allow users to upload a product concept mockup image:

- The image is displayed next to the prediction result as a visual context aid.
- **The image is not sent to the backend and is not used by the ML model.**
- It is stored only in the browser's memory for the duration of the session.
- The app clearly labels this image as visual context only.

### If images are missing

If category image files are not found at `/images/categories/`, the app falls back to the inline SVG illustrations. The app will not crash if image files are absent.

---

## Reproducibility

All scripts use `random_state=42`. Running `train_classification.py` then `train_regression.py` from a clean checkout will reproduce all model files and JSON metadata identically.

---

## AI Workflow Note

This project was built with Claude Code (claude-sonnet-4-6) as a senior ML engineering assistant. See `reports/ai_workflow_reflection.md` for details on how the AI was used, what was verified manually, and what was changed.
