import pool from "../config/db.js";

export const distributeRentIncome = async (req, res) => {

const client = await pool.connect();

try{

const propertyInput =
req.body.property_id ??
req.body.propertyId;

const rentInput =
req.body.total_rent ??
req.body.totalRent ??
req.body.rent_amount ??
req.body.rentAmount;

let property_id = propertyInput;

if(property_id && typeof property_id === "object"){
property_id =
property_id.property_id ??
property_id.propertyId ??
property_id.id ??
property_id.value;
}

const totalRent =
Number(String(rentInput ?? "").replaceAll(",","").trim());

if(!property_id || !Number.isFinite(totalRent) || totalRent <= 0){
return res.status(400).json({
success:false,
message:"Invalid property or rent amount"
});
}

await client.query("BEGIN");

const propertyRes = await client.query(
`
SELECT total_shares, title
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

const totalShares = Number(propertyRes.rows[0].total_shares);
const propertyTitle = propertyRes.rows[0].title;

if(!Number.isFinite(totalShares) || totalShares <= 0){
await client.query("ROLLBACK");
return res.status(400).json({
success:false,
message:"Invalid total shares for property"
});
}

const investors = await client.query(
`
SELECT user_id, shares
FROM investments
WHERE property_id=$1
AND shares > 0
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

const totalPaise = Math.round(totalRent * 100);
let distributedPaise = 0;

for(let i = 0; i < investors.rows.length; i++){

const inv = investors.rows[i];
const shares = Number(inv.shares);

if(!Number.isFinite(shares) || shares <= 0){
continue;
}

let amountPaise;

if(i === investors.rows.length - 1){
amountPaise = totalPaise - distributedPaise;
}
else{
amountPaise = Math.round((shares / totalShares) * totalPaise);
distributedPaise += amountPaise;
}

if(!Number.isFinite(amountPaise) || amountPaise <= 0){
continue;
}

const amount = amountPaise / 100;

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

}

await client.query("COMMIT");

res.json({
success:true,
message:"Rent distributed successfully"
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
