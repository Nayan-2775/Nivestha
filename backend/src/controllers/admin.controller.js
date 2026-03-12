import pool from "../config/db.js";


/**
 * ==========================================
 * DASHBOARD STATS
 * ==========================================
 */
export const getDashboardStats = async (req, res) => {

  try {

    const users =
      await pool.query(
        `SELECT COUNT(*) FROM users`
      );

    const properties =
      await pool.query(
        `SELECT COUNT(*) FROM properties`
      );

    const investments =
      await pool.query(
        `SELECT COUNT(*) FROM investments`
      );

    const transactions =
      await pool.query(
        `SELECT COUNT(*) FROM transactions`
      );

    const totalInvestment =
      await pool.query(
        `
        SELECT COALESCE(SUM(amount_invested),0)
        FROM investments
        `
      );

    res.json({

      success: true,

      stats: {

        total_users:
          Number(users.rows[0].count),

        total_properties:
          Number(properties.rows[0].count),

        total_investments:
          Number(investments.rows[0].count),

        total_transactions:
          Number(transactions.rows[0].count),

        total_investment_amount:
          Number(totalInvestment.rows[0].coalesce)

      }

    });

  }

  catch (error) {

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};




/**
 * ==========================================
 * GET ALL USERS
 * ==========================================
 */
export const getAllUsers = async (req,res)=>{

  try{

    const result =
      await pool.query(

        `
        SELECT
        user_id,
        full_name,
        email,
        kyc_status,
        created_at
        FROM users
        ORDER BY created_at DESC
        `
      );


    res.json({

      success:true,

      users:result.rows

    });

  }

  catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};




/**
 * ==========================================
 * GET ALL PROPERTIES
 * ==========================================
 */
export const getAllPropertiesAdmin =
async (req,res)=>{

  try{

    const result =
      await pool.query(
        `
        SELECT *
        FROM properties
        ORDER BY created_at DESC
        `
      );


    res.json({

      success:true,

      properties:result.rows

    });

  }

  catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};




/**
 * ==========================================
 * GET ALL INVESTMENTS
 * ==========================================
 */
export const getAllInvestments =
async (req,res)=>{

  try{

    const result =
      await pool.query(

        `
        SELECT
        i.investment_id,
        u.full_name,
        p.title,
        i.shares,
        i.amount_invested,
        i.created_at
        FROM investments i
        JOIN users u
        ON u.user_id=i.user_id
        JOIN properties p
        ON p.property_id=i.property_id
        ORDER BY i.created_at DESC
        `
      );


    res.json({

      success:true,

      investments:result.rows

    });

  }

  catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};




/**
 * ==========================================
 * GET ALL TRANSACTIONS
 * ==========================================
 */
export const getAllTransactions =
async (req,res)=>{

  try{

    const result =
      await pool.query(

        `
        SELECT
        t.transaction_id,
        u.full_name,
        t.type,
        t.amount,
        t.created_at
        FROM transactions t
        JOIN users u
        ON u.user_id=t.user_id
        ORDER BY t.created_at DESC
        `
      );


    res.json({

      success:true,

      transactions:result.rows

    });

  }

  catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};




/**
 * ==========================================
 * GET AUDIT LOGS
 * ==========================================
 */
export const getAuditLogs =
async (req,res)=>{

  try{

    const result =
      await pool.query(

        `
        SELECT *
        FROM audit_logs
        ORDER BY created_at DESC
        `
      );


    res.json({

      success:true,

      logs:result.rows

    });

  }

  catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};

/**
 * ==========================================
 * APPROVE USER
 * ==========================================
 */
export const approveUser = async (req,res)=>{

  const { user_id } = req.body;

  try{

    await pool.query(
      `
      UPDATE users
      SET kyc_status='approved',
      updated_at=CURRENT_TIMESTAMP
      WHERE user_id=$1
      `,
      [user_id]
    );

    res.json({
      success:true,
      message:"User approved successfully"
    });

  }

  catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};

/**
 * ==========================================
 * REJECT USER
 * ==========================================
 */
export const rejectUser = async (req,res)=>{

  const { user_id } = req.body;

  try{

    await pool.query(
      `
      UPDATE users
      SET kyc_status='rejected',
      updated_at=CURRENT_TIMESTAMP
      WHERE user_id=$1
      `,
      [user_id]
    );

    res.json({
      success:true,
      message:"User rejected"
    });

  }

  catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};

/**
 * ==========================================
 * RENT DISTRIBUTION
 * ==========================================
 */

export const distributeRent = async (req,res)=>{

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

const client = await pool.connect();

try{

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


// Get property
const property =
await client.query(
`
SELECT title
FROM properties
WHERE property_id=$1
`,
[property_id]
);

if(property.rowCount === 0){
await client.query("ROLLBACK");
return res.status(404).json({
success:false,
message:"Property not found"
});
}

const propertyTitle = property.rows[0].title;


// Get all investors with invested amount
const investors =
await client.query(
`
SELECT user_id, amount_invested
FROM investments
WHERE property_id=$1
AND amount_invested > 0
ORDER BY user_id
`,
[property_id]
);

if(investors.rowCount === 0){
await client.query("ROLLBACK");
return res.status(400).json({
success:false,
message:"No investors found for this property"
});
}

let creditedInvestors = 0;
let totalDistributed = 0;

// Distribute rent as 3%-4% of each investor's amount
for(let i = 0; i < investors.rows.length; i++){

const investor = investors.rows[i];
const investedAmount = Number(investor.amount_invested);

if(!Number.isFinite(investedAmount) || investedAmount <= 0){
continue;
}

const rentAmount =
Number(((investedAmount * totalRent) / 100).toFixed(2));

if(!Number.isFinite(rentAmount) || rentAmount <= 0){
continue;
}

const walletResult = await client.query(
`
SELECT wallet_id
FROM wallets
WHERE user_id=$1
FOR UPDATE
`,
[investor.user_id]
);

if(walletResult.rowCount === 0){
continue;
}

const walletId = walletResult.rows[0].wallet_id;


// Update wallet
await client.query(
`
UPDATE wallets
SET balance = COALESCE(NULLIF(balance::text,'NaN')::numeric,0) + $1
WHERE wallet_id=$2
`,
[rentAmount, walletId]
);


// Create transaction
await client.query(
`
INSERT INTO transactions
(wallet_id,user_id,property_id,type,amount)
VALUES ($1,$2,$3,'rental_income',$4)
`,
[walletId, investor.user_id, property_id, rentAmount]
);

await client.query(
`
INSERT INTO notifications (user_id,message)
VALUES ($1,$2)
`,
[
investor.user_id,
`You have received your rent share from ${propertyTitle}.`
]
);

creditedInvestors += 1;
totalDistributed += rentAmount;

}

if(req.user?.user_id){
await client.query(
`
INSERT INTO notifications (user_id,message)
VALUES ($1,$2)
`,
[
req.user.user_id,
`Rent distributed for ${propertyTitle} at ${totalRent}%. Investors credited: ${creditedInvestors}. Total payout: Rs ${totalDistributed.toLocaleString()}.`
]
);
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

catch(error){

await client.query("ROLLBACK");

res.status(500).json({
success:false,
message:error.message
});

}

finally{

client.release();

}

};

/**
 * ==========================================
 * ADD PROPERTY
 * ==========================================
 */

export const addProperty = async (req,res)=>{

const client = await pool.connect();

try{

await client.query("BEGIN");

const {
title,
location,
total_value,
total_shares,
roi,
description
} = req.body;

const image_url = req.file 
? `/uploads/${req.file.filename}`
: null;


// Calculate price per share
const price_per_share =
Number(total_value) / Number(total_shares);


// 1️⃣ Insert property
const propertyResult = await client.query(
`
INSERT INTO properties
(title,location,description,total_value,total_shares,available_shares,roi)
VALUES ($1,$2,$3,$4,$5,$6,$7)
RETURNING property_id
`,
[
title,
location,
description,
Number(total_value),
Number(total_shares),
Number(total_shares), // available_shares = total_shares
Number(roi)
]
);

const property_id = propertyResult.rows[0].property_id;


// 2️⃣ Insert image if uploaded
if(req.file){

const image_url = `/uploads/${req.file.filename}`;

await client.query(
`
INSERT INTO property_images
(property_id,image_url,is_primary)
VALUES ($1,$2,true)
`,
[property_id,image_url]
);

}

await client.query("COMMIT");

res.json({
success:true,
message:"Property created successfully",
property_id,
price_per_share
});

}catch(error){

await client.query("ROLLBACK");

console.error("ADD PROPERTY ERROR:",error);

res.status(500).json({
success:false,
message:error.message
});

}finally{

client.release();

}

};

/**
 * ==========================================
 * APPROVE KYC
 * ==========================================
 */

export const approveKYC = async (req,res)=>{

const { id } = req.params;

await pool.query(
`UPDATE users SET kyc_status='approved' WHERE user_id=$1`,
[id]
);

res.json({
success:true,
message:"KYC Approved"
});

};

/**
 * ==========================================
 * REJECT KYC
 * ==========================================
 */


export const rejectKYC = async (req,res)=>{

const { id } = req.params;

await pool.query(
`UPDATE users SET kyc_status='rejected' WHERE user_id=$1`,
[id]
);

res.json({
success:true,
message:"KYC Rejected"
});

};
