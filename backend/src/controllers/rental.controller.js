import pool from "../config/db.js";

export const distributeRentIncome = async (req, res) => {

const client = await pool.connect();

try{

const propertyInput =
req.body.property_id ??
req.body.propertyId;

const percentageInput =
req.body.distribution_percentage ??
req.body.distributionPercentage ??
req.body.percentage ??
req.body.rent_percentage ??
req.body.rentPercentage;

let property_id = propertyInput;

if(property_id && typeof property_id === "object"){
property_id =
property_id.property_id ??
property_id.propertyId ??
property_id.id ??
property_id.value;
}

const totalRent =
Number(String(percentageInput ?? "").replaceAll(",","").trim());

if(
!property_id ||
!Number.isFinite(totalRent) ||
totalRent < 3 ||
totalRent > 4
){
return res.status(400).json({
success:false,
message:"Distribution percentage must be between 3% and 4%"
});
}

await client.query("BEGIN");

const propertyRes = await client.query(
`
SELECT title
FROM properties
WHERE property_id=$1
FOR UPDATE
`,
[property_id]
);

if(propertyRes.rows.length === 0){
await client.query("ROLLBACK");
return res.status(404).json({
success:false,
message:"Property not found"
});
}

const propertyTitle = propertyRes.rows[0].title;

const investors = await client.query(
`
SELECT user_id, amount_invested
FROM investments
WHERE property_id=$1
AND amount_invested > 0
ORDER BY user_id
`,
[property_id]
);

if(investors.rows.length === 0){
await client.query("ROLLBACK");
return res.status(400).json({
success:false,
message:"No investors found for this property"
});
}

let totalDistributed = 0;
let creditedInvestors = 0;

for(let i = 0; i < investors.rows.length; i++){

const inv = investors.rows[i];
const investedAmount = Number(inv.amount_invested);

if(!Number.isFinite(investedAmount) || investedAmount <= 0){
continue;
}

const amount =
Number(((investedAmount * totalRent) / 100).toFixed(2));

if(!Number.isFinite(amount) || amount <= 0){
continue;
}

const walletRes = await client.query(
`
SELECT wallet_id
FROM wallets
WHERE user_id=$1
FOR UPDATE
`,
[inv.user_id]
);

if(walletRes.rowCount === 0){
continue;
}

const walletId = walletRes.rows[0].wallet_id;

await client.query(
`
UPDATE wallets
SET balance = COALESCE(NULLIF(balance::text,'NaN')::numeric,0) + $1
WHERE wallet_id=$2
`,
[amount, walletId]
);

await client.query(
`
INSERT INTO transactions (wallet_id,user_id,property_id,type,amount)
VALUES ($1,$2,$3,'rental_income',$4)
`,
[walletId, inv.user_id, property_id, amount]
);

await client.query(
`
INSERT INTO notifications (user_id,message)
VALUES ($1,$2)
`,
[
inv.user_id,
`You have received your rent share from ${propertyTitle}.`
]
);

creditedInvestors += 1;
totalDistributed += amount;

}

await client.query("COMMIT");

res.json({
success:true,
message:`Rent distributed successfully at ${totalRent}%`,
distribution_percentage: totalRent,
total_distributed: Number(totalDistributed.toFixed(2)),
credited_investors: creditedInvestors
});

}

catch(err){

await client.query("ROLLBACK");
console.error("RENT DISTRIBUTION ERROR:", err);

res.status(500).json({
success:false,
message:"Server error"
});

}
finally{
client.release();
}

};
