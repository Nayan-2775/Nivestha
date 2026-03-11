import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBRegressor

# ===============================
# LOAD DATA
# ===============================
df = pd.read_excel("./data/properties.xlsx")

# -------------------------------
# CLEAN DATA
# -------------------------------

# Remove rows with missing locations
df = df.dropna(subset=["Location"])

# Convert BHK safely
df["BHK"] = df["BHK"].astype(str).str.extract(r'(\d+\.?\d*)')
df["BHK"] = pd.to_numeric(df["BHK"], errors="coerce")

# Fill missing numeric values
df["Sqft"] = df["Sqft"].fillna(df["Sqft"].median())
df["Price Per Sqft"] = df["Price Per Sqft"].fillna(df["Price Per Sqft"].median())
df["Years"] = df["Years"].fillna(0)
df["rental_yield"] = df["rental_yield"].fillna(df["rental_yield"].median())

# -------------------------------
# ENCODE LOCATION
# -------------------------------
le = LabelEncoder()

df["locality_encoded"] = le.fit_transform(df["Location"].astype(str))

# -------------------------------
# FEATURES & TARGETS
# -------------------------------

X = df[["locality_encoded", "Sqft", "BHK", "Price Per Sqft", "Years", "rental_yield"]]

y_price = df["Price"]
y_risk = df["risk_score"]

# -------------------------------
# TRAIN / TEST SPLIT
# -------------------------------

X_train, X_test, y_price_train, y_price_test = train_test_split(
    X, y_price, test_size=0.2, random_state=42
)

_, _, y_risk_train, y_risk_test = train_test_split(
    X, y_risk, test_size=0.2, random_state=42
)

# -------------------------------
# MODELS
# -------------------------------

price_model = XGBRegressor(
    n_estimators=300,
    learning_rate=0.08,
    max_depth=6,
    random_state=42
)

risk_model = XGBRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)

# -------------------------------
# TRAIN MODELS
# -------------------------------

price_model.fit(X_train, y_price_train)
risk_model.fit(X_train, y_risk_train)

# -------------------------------
# SAVE MODELS
# -------------------------------

joblib.dump(price_model, "./models/price_model.joblib")
joblib.dump(risk_model, "./models/risk_model.joblib")
joblib.dump(le, "./models/locality_encoder.joblib")

print("🎉 Models trained & saved successfully!")