import axios from "axios";
import db from "../config/db.js";

export const predictProperty = async (req, res) => {

try {

const { property_id } = req.body;
const investmentYearsInput =
req.body.investment_years ??
req.body.investmentYears ??
1;

const investmentYears =
Math.min(
30,
Math.max(1, Math.round(Number(investmentYearsInput) || 1))
);

if (!property_id) {
return res.status(400).json({
success:false,
message:"Property ID required"
});
}

/* FETCH PROPERTY DATA */

const property = await db.query(
`SELECT location, total_value, total_shares, roi
 FROM properties
 WHERE property_id = $1`,
[property_id]
);

if(property.rows.length === 0){
return res.status(404).json({
success:false,
message:"Property not found"
});
}

const { location, total_value, total_shares, roi } = property.rows[0];

/* CALL PYTHON AI SERVICE */

const response = await axios.post(
"http://localhost:5001/predict",
{
location,
price: total_value,
roi,
investment_years: investmentYears
}
);

const currentValue = Number(total_value);
const totalShares = Number(total_shares);
const predictedPrice = Number(response.data?.predicted_price);

const growthAmount =
Number.isFinite(predictedPrice) && Number.isFinite(currentValue)
? predictedPrice - currentValue
: null;

const growthPercent =
growthAmount !== null && currentValue > 0
? (growthAmount / currentValue) * 100
: null;

const currentPerShare =
Number.isFinite(totalShares) && totalShares > 0
? currentValue / totalShares
: null;

const predictedPerShare =
Number.isFinite(totalShares) && totalShares > 0 && Number.isFinite(predictedPrice)
? predictedPrice / totalShares
: null;

res.json({
success:true,
prediction: {
...response.data,
investment_years: investmentYears,
current_value: currentValue,
predicted_1y_value: Number.isFinite(predictedPrice) ? predictedPrice : null,
predicted_value: Number.isFinite(predictedPrice) ? predictedPrice : null,
growth_amount_1y: growthAmount,
growth_percent_1y: growthPercent,
growth_amount: growthAmount,
growth_percent: growthPercent,
current_per_share: currentPerShare,
predicted_per_share_1y: predictedPerShare,
predicted_per_share: predictedPerShare
}
});

}catch(err){

console.error("AI SERVICE ERROR:", err.response?.data || err.message);

res.status(500).json({
success:false,
message:"AI prediction failed"
});
}

};
