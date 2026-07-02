# AI Workflow Reflection

## How Claude Code Was Used

Claude Code (claude-sonnet-4-6 via the Claude Code CLI) was used as a senior full-stack ML engineering assistant throughout this project. The workflow was:

1. **Architecture design** — Described the full project specification to Claude and received a structured plan covering the ML pipeline, FastAPI backend, React frontend, and report structure.
2. **Code generation** — Claude generated all Python source files (`config.py`, `data.py`, `features.py`, `train_classification.py`, `train_regression.py`, `evaluate.py`, `explain.py`, `utils.py`), the FastAPI backend (`main.py`, `schemas.py`), and the full React frontend (all components).
3. **Debugging** — Claude identified and fixed issues: a duplicate function in `backend/main.py`, an invalid Python import (`import numpy as np as np2`), an XGBoost OpenMP dependency (`libomp` on macOS), and the DummyRegressor selection issue.
4. **Report writing** — Claude drafted all written deliverables (executive summary, analysis report, slides, this reflection).

## Which MCP Servers Would Be Useful

**Filesystem MCP** — would allow Claude to read and edit files directly across the repository without requiring me to paste file paths manually, making multi-file edits faster and less error-prone.

**GitHub MCP** — would enable Claude to create commits, push branches, and open pull requests directly. For a project like this, it would have automated the repository setup and tracked changes without requiring manual `git` commands.

**Context7 MCP** — would allow Claude to pull current documentation for scikit-learn, XGBoost, FastAPI, and React/Vite in real time. This is particularly useful because API details change between versions (e.g., `sparse_output` vs `sparse` in OneHotEncoder between scikit-learn 1.2 and 1.4), and Claude's training data may be slightly out of date.

**Playwright MCP** — would allow Claude to open a browser, navigate to `localhost:5173`, fill in the product form, click Predict, and confirm the prediction cards render correctly — all without me having to test manually. This would close the feedback loop for UI verification.

## How I Verified the AI Output

- **Checked for data leakage**: confirmed `Rating` is not used in the classification features, and `Price_USD` is not used in the regression features. Reviewed the feature lists in `config.py`.
- **Re-ran training scripts**: executed `python src/train_classification.py` and `python src/train_regression.py` from a clean state and confirmed the outputs.
- **Checked metrics**: examined the leaderboard JSON files to confirm reported metrics are plausible (ROC-AUC between 0 and 1, R² values explained).
- **Tested the backend**: ran `python3 -c "..."` to import the app, load models, and run a prediction — confirmed correct types and reasonable values.
- **Reviewed the data findings**: ran a correlation analysis and discovered the dataset is synthetic, which matched the near-zero model performance. This was not a code error but a data quality finding.
- **Compared predictions to expected ranges**: the price prediction of ~$81 for a "Drunk Elephant Serum" is consistent with the dataset's uniform price distribution ($10–$150, mean $80).

## Changes Made Manually

- Added the `libomp` fix (Claude flagged the XGBoost OpenMP error; I ran `brew install libomp` from the terminal).
- Adjusted the DummyRegressor selection logic: Claude initially selected it as "best" (R²=0 vs negative for all others), which would have made the app return the same price for all inputs. I asked Claude to fix this by preferring the best non-baseline model.
- Verified the import structure worked by running `python3 -c "import backend.main"` and confirmed no circular imports.

## Rough Cost and Effort

- Total conversation: approximately 1 session, ~2 hours.
- Human decisions made: dataset investigation (understanding it was synthetic), architecture trade-offs (what to include in the app form), DummyRegressor selection correction, deployment strategy.
- AI-generated: ~95% of the code, all boilerplate, all configuration files, and the first drafts of all written reports.

## What I Would Do Differently With Real Data

With a real dataset containing genuine price differentiation and consumer ratings tied to actual product attributes, the ML pipeline here would produce meaningful results. The main change would be adding richer features: brand tier (luxury vs. drugstore), retailer channel, ingredient complexity score, and regional market data. The architecture would not need to change.
