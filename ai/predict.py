from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DATA_PATH = BASE_DIR / "data" / "properties.xlsx"

price_model = joblib.load(MODELS_DIR / "price_model.joblib")
risk_model = joblib.load(MODELS_DIR / "risk_model.joblib")
locality_encoder = joblib.load(MODELS_DIR / "locality_encoder.joblib")


def _build_reference_stats():
    default_stats = {
        "sqft": 850.0,
        "bhk": 2.0,
        "price_per_sqft": 30000.0,
        "years": 5.0,
        "rental_yield": 4.7,
    }

    if not DATA_PATH.exists():
        return {}, default_stats

    df = pd.read_excel(DATA_PATH)

    df["Location"] = df["Location"].astype(str).str.strip()
    df["BHK"] = pd.to_numeric(df["BHK"].astype(str).str.extract(r"(\d+\.?\d*)")[0], errors="coerce")

    for c in ["Sqft", "BHK", "Price Per Sqft", "Years", "rental_yield"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    grouped = (
        df.dropna(subset=["Location"])
        .groupby("Location")[["Sqft", "BHK", "Price Per Sqft", "Years", "rental_yield"]]
        .median()
        .reset_index()
    )

    by_location = {}
    for _, row in grouped.iterrows():
        by_location[row["Location"]] = {
            "sqft": float(row["Sqft"]),
            "bhk": float(row["BHK"]),
            "price_per_sqft": float(row["Price Per Sqft"]),
            "years": float(row["Years"]),
            "rental_yield": float(row["rental_yield"]),
        }

    global_med = df[["Sqft", "BHK", "Price Per Sqft", "Years", "rental_yield"]].median(numeric_only=True)
    default_stats = {
        "sqft": float(global_med.get("Sqft", default_stats["sqft"])),
        "bhk": float(global_med.get("BHK", default_stats["bhk"])),
        "price_per_sqft": float(global_med.get("Price Per Sqft", default_stats["price_per_sqft"])),
        "years": float(global_med.get("Years", default_stats["years"])),
        "rental_yield": float(global_med.get("rental_yield", default_stats["rental_yield"])),
    }

    return by_location, default_stats


LOCATION_STATS, DEFAULT_STATS = _build_reference_stats()


def _clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))


def _safe_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _safe_int(value, default=1):
    try:
        return int(round(float(value)))
    except (TypeError, ValueError):
        return int(default)


def _predict_with_derived_features(location, total_price, roi, investment_years):
    stats = LOCATION_STATS.get(location, DEFAULT_STATS)

    locality_name = location if location in locality_encoder.classes_ else locality_encoder.classes_[0]
    locality_encoded = locality_encoder.transform([locality_name])[0]

    estimated_sqft = _clamp(total_price / max(stats["price_per_sqft"], 1.0), 250.0, 12000.0)
    inferred_ppsf = _clamp(total_price / estimated_sqft, 1000.0, 200000.0)

    bhk = _clamp(stats["bhk"], 1.0, 8.0)
    years_feature = _clamp(stats["years"], 0.0, 15.0)
    rental_yield = _clamp(roi if roi > 0 else stats["rental_yield"], 2.5, 6.5)

    features = np.array([[locality_encoded, estimated_sqft, bhk, inferred_ppsf, years_feature, rental_yield]])

    base_predicted_price = float(price_model.predict(features)[0])
    risk_score = float(risk_model.predict(features)[0])

    # Convert single prediction into annualized growth and project for selected years.
    raw_model_rate = (base_predicted_price / total_price) - 1.0 if total_price > 0 else 0.0
    raw_model_rate = _clamp(raw_model_rate, -0.15, 0.25)

    roi_rate = rental_yield / 100.0
    blended_annual_rate = (0.45 * raw_model_rate) + (0.55 * roi_rate)

    # Never let projection go below principal. Keep conservative positive floor.
    blended_annual_rate = max(0.01, blended_annual_rate)

    projected_price = total_price * ((1.0 + blended_annual_rate) ** investment_years)

    # Stability guardrail against unrealistic spikes.
    max_ratio = 1.0 + (0.35 * investment_years)
    ratio = projected_price / total_price if total_price > 0 else 1.0
    if not np.isfinite(projected_price) or ratio > max_ratio:
        projected_price = total_price * ((1.0 + roi_rate) ** investment_years)

    # Longer horizon should slightly increase perceived risk.
    risk_score = _clamp(risk_score + (0.08 * max(0, investment_years - 1)), 1.0, 10.0)

    return projected_price, risk_score, {
        "locality_encoded": int(locality_encoded),
        "sqft": round(estimated_sqft, 2),
        "bhk": round(bhk, 2),
        "price_per_sqft": round(inferred_ppsf, 2),
        "years_feature": round(years_feature, 2),
        "rental_yield": round(rental_yield, 2),
        "investment_years": int(investment_years),
        "annual_growth_rate": round(blended_annual_rate * 100.0, 2),
    }


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    location = str(data.get("location", "")).strip()
    price = _safe_float(data.get("price"), 0)
    roi = _safe_float(data.get("roi"), 0)
    investment_years = _safe_int(data.get("investment_years", 1), 1)
    investment_years = int(_clamp(investment_years, 1, 30))

    if not location or price <= 0:
        return jsonify({"error": "location and price are required"}), 400

    predicted_price, risk_score, features_used = _predict_with_derived_features(
        location,
        price,
        roi,
        investment_years,
    )

    return jsonify(
        {
            "predicted_price": round(predicted_price, 2),
            "risk_score": round(risk_score, 2),
            "investment_years": investment_years,
            "features_used": features_used,
        }
    )


if __name__ == "__main__":
    app.run(port=5001, debug=True)
