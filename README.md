# Smart Price Comparison & Deal Finder

A complete, professional web application and predictive analytics system designed for major e-commerce platforms in India (**Amazon India** and **Flipkart**). This project serves as an end-to-end internship submission, featuring:
1. A modern, premium **responsive dark-mode user dashboard** interface.
2. A **from-scratch client-side AI/ML engine** built in vanilla JavaScript (matrix operations, polynomial curve fitting, Holt's linear exponential smoothing, and seasonality forecasting).
3. A **production-ready Python ML pipeline** implementing a Random Forest Regressor time-series model for historical analysis, evaluation, and serialization.

---

## Project Structure

```text
├── index.html                 # Main interface dashboard with tabs and interactive inputs
├── styles.css                 # Premium dark-mode glassmorphic styling & UI accents
├── app.js                     # Coordination logic, local storage alerts, and Chart.js feeds
├── dataset.js                 # 90-day Indian e-commerce historical dataset generator
├── ml_engine.js               # Matrix least squares solver, Polynomial regressions & Holt's ES
├── train_model.py             # Python ML training pipeline (generates, trains, and plots)
└── README.md                  # Comprehensive developer documentation & internship guide
```

---

## 1. Web Application & JS AI Engine (Interface Module)

The web dashboard is designed to run self-contained directly inside any modern web browser. Simply open **`index.html`** to run the app.

### Core Modules:
* **Smart Deal Finder:** Performs side-by-side e-commerce queries, comparing prices, coupons, and sellers on Amazon India and Flipkart, highlighting the **Lowest Price Deal** instantly with direct purchase buttons.
* **AI Price Prediction Engine:**
  * Fits historical price series using a **Polynomial Regression Model (Degree 1 to 3)**. The engine constructs a normal equation matrix and solves it in real-time using a custom **Gaussian Elimination solver**.
  * Fits short-term trends using **Holt's Double Exponential Smoothing** to capture momentum.
  * Combines forecasts into an **Ensemble Model** adjusting for upcoming Indian holiday sales (Big Billion Days / Great Indian Festival seasonality).
  * **Interactive UI Controls:** Sliders let you change the polynomial degree and forecast horizon in real-time, instantly retraining the JS model and updating charts and diagnostics.
  * **Model Diagnostics Panel:** Renders $R^2$ fitness scores, Mean Absolute Percentage Error (MAPE), training speeds, and the exact mathematical regression curve equation (e.g. $y = -0.04t^2 + 12.4t + 129000$).
* **Price Alert System:** Allows users to track target price thresholds. Active trackers are stored in the browser's `localStorage` and trigger interactive toast drop-alert slide-ins when target limits are reached.
* **User Dashboard:** Aggregates overall tracked items, accumulated savings, active alerts, and plots index charts.

---

## 2. Python ML Working Model Pipeline (`train_model.py`)

To satisfy internship submissions demanding a standard Python-based AI/ML workflow, the project includes **`train_model.py`**. This pipeline performs dataset generation, exploratory data analysis, feature engineering, model training, evaluation, and serialization.

### Requirements:
Install the standard data science and machine learning packages:
```bash
pip install pandas numpy scikit-learn matplotlib
```

### How to Run:
Execute the script from your terminal:
```bash
python train_model.py
```

### Pipeline Execution Steps:
1. **Dataset Synthesis (`historical_prices.csv`):** Creates 90 days of daily price histories for popular products, modeling realistic weekend discounts, competitive pricing battles, and shopping holiday event drops.
2. **Feature Engineering:** Extracts date features (`day_index`, `day_of_week`, `day_of_month`) and event signals (`is_sale_season`) as predictors.
3. **Train-Test Split:** Splices the chronological history into an 80% training window and a 20% validation split.
4. **Machine Learning Model Training:**
   * **Linear Regression:** Establishes a linear baseline.
   * **Random Forest Regressor:** A robust ensemble model fitting complex non-linear seasonal patterns.
5. **Analytics Diagnostics:** Prints performance metrics to evaluate accuracy:
   * **$R^2$ Score (Coefficient of Determination):** Fit accuracy (1.0 is a perfect fit).
   * **MAE (Mean Absolute Error):** Average price deviation in Rupees.
   * **RMSE (Root Mean Squared Error):** Standard deviation of prediction residuals.
6. **30-Day Ahead Forecasting:** Projects the next 30 days of pricing, incorporating upcoming seasonal promotional variables.
7. **Matplotlib Visuals (`price_forecast_plot.png`):** Automatically saves a high-quality visualization plotting the actual historical curve alongside the Random Forest predictive curve.
8. **Model Serialization (`price_predictor_model.pkl`):** Serializes the trained Random Forest model using Python's `pickle` library, demonstrating deployment readiness for web API integrations.

---

## Internship Report deliverables Checklist

When submitting this project for your internship, you can include the following assets in your report:
* **The Mathematical Formulations:** Include the formulas for Ordinary Least Squares (OLS) regression and Holt's Double Exponential Smoothing (detailed in [walkthrough.md](file:///C:/Users/liyon/.gemini/antigravity/brain/e239c965-d22f-42f2-8ee6-8a4387b9e9a3/walkthrough.md)).
* **Comparative Pricing Dataset:** Reference the generated `historical_prices.csv` as your primary time-series repository.
* **Model Diagnostic Comparison:** Present the printed terminal outputs showing the Random Forest's superior $R^2$ scores and lower error rates compared to Linear Regression.
* **Visual Forecasting Curve:** Include the generated `price_forecast_plot.png` plot showing the predicted price rebound curve.
* **Web UI Dashboard Screenshots:** Include screenshots of your active tabs, showing the interactive sliders and diagnostics updating dynamically inside the browser.
