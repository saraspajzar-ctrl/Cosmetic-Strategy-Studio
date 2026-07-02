# Backend — Beauty Product Intelligence API

FastAPI backend that serves predictions from trained scikit-learn / XGBoost pipelines.

## Run locally

```bash
# From repo root
uvicorn backend.main:app --reload
```

API docs available at: http://localhost:8000/docs

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /metadata | Model metadata and feature importances |
| GET | /data/summary | Dataset statistics for dashboard |
| GET | /models/leaderboard | All model metrics |
| POST | /predict/rating | Predict high-rating probability |
| POST | /predict/price | Predict price in USD |
| POST | /predict/both | Both predictions + recommendation |

## Deploy to Render

1. Push repo to GitHub.
2. Create a new **Web Service** on Render.
3. Set Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
4. The `models/` directory must be committed (joblib files are required at startup).
5. Set environment variable `PYTHON_VERSION=3.11` if needed.
