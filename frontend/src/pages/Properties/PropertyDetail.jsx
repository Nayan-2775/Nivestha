import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPropertyById,
  predictAI
} from "../../context/ApiClient";

const { id } = useParams();

const [property, setProperty] = useState(null);
const [loading, setLoading] = useState(true);

// AI states
const [aiInsight, setAiInsight] = useState(null);
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState(null);

useEffect(() => {
  const fetchProperty = async () => {
    try {
      const res = await getPropertyById(id);
      setProperty(res.data);
    } catch (err) {
      console.error("Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  fetchProperty();
}, [id]);

const fetchAIInsights = async (property) => {
  try {
    setAiLoading(true);
    setAiError(null);

    const payload = {
      property_id: property.id,
      locality: property.locality,
      area_sqft: property.area_sqft,
      BHK: property.bhk,
      price_per_sqft: property.price_per_sqft,
      years: property.years,
      rental_yield: property.rental_yield,
    };

    const res = await predictAI(payload);
    setAiInsight(res.data);

  } catch (err) {
    console.error(err);
    setAiError("AI insights unavailable");
  } finally {
    setAiLoading(false);
  }
};

useEffect(() => {
  if (property) {
    fetchAIInsights(property);
  }
}, [property]);

{/* AI Insights Section */}
<div className="mt-8 p-5 rounded-lg border bg-gray-50">
  <h3 className="text-lg font-semibold mb-4">
    🤖 AI Investment Insights
  </h3>

  {aiLoading && (
    <p className="text-sm text-gray-500">Analyzing property data...</p>
  )}

  {aiError && (
    <p className="text-sm text-red-500">{aiError}</p>
  )}

  {aiInsight && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-gray-500">Predicted Price</p>
        <p className="font-bold text-lg">
          ₹ {Number(aiInsight.predicted_price).toLocaleString()}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Rental Yield</p>
        <p className="font-bold text-lg">
          {aiInsight.rental_yield} %
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Risk Score</p>
        <p
          className={`font-bold text-lg ${
            aiInsight.risk_score <= 3
              ? "text-green-600"
              : aiInsight.risk_score <= 6
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {aiInsight.risk_score} / 10
        </p>
      </div>
    </div>
  )}

  <p className="text-xs text-gray-400 mt-4">
    AI predictions are indicative and not guaranteed.
  </p>
</div>
