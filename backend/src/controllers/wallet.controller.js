import pool from "../config/db.js";
import auditLog from "../utils/auditLog.js";



/**
 * ==========================================
 * GET WALLET BALANCE
 * ==========================================
 */
export const getWallet = async (req, res) => {

  try {

    const result = await pool.query(

      `
      SELECT
      wallet_id,
      COALESCE(NULLIF(balance::text,'NaN')::numeric,0) AS balance,
      created_at
      FROM wallets
      WHERE user_id=$1
      `,

      [req.user.user_id]

    );


    res.json({

      success: true,

      wallet: result.rows[0]

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

/**
 * ==========================================
 * DEPOSIT MONEY
 * ==========================================
 */
export const depositMoney = async (req, res) => {

  const { amount } = req.body;

  if (!amount || amount <= 0) {

    return res.status(400).json({

      success: false,

      message: "Invalid amount"

    });

  }


  const client = await pool.connect();


  try {

    await client.query("BEGIN");


    const walletResult =
      await client.query(

        `
        SELECT wallet_id
        FROM wallets
        WHERE user_id=$1
        FOR UPDATE
        `,

        [req.user.user_id]

      );


    const wallet = walletResult.rows[0];


    await client.query(

      `
      UPDATE wallets
      SET balance = COALESCE(NULLIF(balance::text,'NaN')::numeric,0) + $1
      WHERE wallet_id=$2
      `,

      [amount, wallet.wallet_id]

    );



    await client.query(

      `
      INSERT INTO transactions
      (wallet_id,user_id,type,amount)
      VALUES($1,$2,'deposit',$3)
      `,

      [
        wallet.wallet_id,
        req.user.user_id,
        amount
      ]

    );



    await auditLog(

      req.user.user_id,

      "DEPOSIT",

      "WALLET",

      wallet.wallet_id,

      { amount }

    );


    await client.query("COMMIT");


    res.json({

      success: true,

      message: "Deposit successful"

    });

  }

  catch (error) {

    await client.query("ROLLBACK");

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

  finally {

    client.release();

  }

};

/**
 * ==========================================
 * WITHDRAW MONEY
 * ==========================================
 */
export const withdrawMoney = async (req, res) => {

  const { amount } = req.body;


  if (!amount || amount <= 0) {

    return res.status(400).json({

      success: false,

      message: "Invalid amount"

    });

  }

  const client = await pool.connect();


  try {

    await client.query("BEGIN");


    const walletResult =
      await client.query(

        `
        SELECT
        wallet_id,
        COALESCE(NULLIF(balance::text,'NaN')::numeric,0) AS balance
        FROM wallets
        WHERE user_id=$1
        FOR UPDATE
        `,

        [req.user.user_id]

      );


    const wallet = walletResult.rows[0];


    if (wallet.balance < amount) {

      throw new Error("Insufficient balance");

    }


    await client.query(

      `
      UPDATE wallets
      SET balance = COALESCE(NULLIF(balance::text,'NaN')::numeric,0) - $1
      WHERE wallet_id=$2
      `,

      [amount, wallet.wallet_id]

    );

    await client.query(

      `
      INSERT INTO transactions
      (wallet_id,user_id,type,amount)
      VALUES($1,$2,'withdrawal',$3)
      `,

      [
        wallet.wallet_id,
        req.user.user_id,
        amount
      ]

    );


    await auditLog(

      req.user.user_id,

      "WITHDRAW",

      "WALLET",

      wallet.wallet_id,

      { amount }

    );


    await client.query("COMMIT");


    res.json({

      success: true,

      message: "Withdrawal successful"

    });

  }

  catch (error) {

    await client.query("ROLLBACK");

    res.status(400).json({

      success: false,

      message: error.message

    });

  }

  finally {

    client.release();

  }

};

/**
 * ==========================================
 * TRANSACTION HISTORY
 * ==========================================
 */
export const getTransactions = async (req, res) => {

  try {

    const result =
      await pool.query(

        `
        SELECT
        transaction_id,
        type,
        amount,
        created_at
        FROM transactions
        WHERE user_id=$1
        ORDER BY created_at DESC
        `,

        [req.user.user_id]

      );


    res.json({

      success: true,

      transactions: result.rows

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

export const getWalletStats = async (req,res)=>{

try{

const userId = req.user.user_id;


/* ============================= */
/* TOTAL DEPOSIT */
/* ============================= */

const deposit = await pool.query(
`
SELECT COALESCE(SUM(amount),0) AS total_deposited
FROM transactions
WHERE user_id=$1 AND type='deposit'
`,
[userId]
);


/* ============================= */
/* TOTAL WITHDRAW */
/* ============================= */

const withdraw = await pool.query(
`
SELECT COALESCE(SUM(amount),0) AS total_withdrawn
FROM transactions
WHERE user_id=$1 AND type='withdrawal'
`,
[userId]
);


/* ============================= */
/* TOTAL INVESTMENT */
/* ============================= */

const investment = await pool.query(
`
SELECT COALESCE(SUM(amount_invested),0) AS total_invested
FROM investments
WHERE user_id=$1
`,
[userId]
);


res.json({

success:true,

stats:{
total_deposited: deposit.rows[0].total_deposited,
total_withdrawn: withdraw.rows[0].total_withdrawn,
total_invested: investment.rows[0].total_invested
}

});

}catch(error){

console.log("WALLET STATS ERROR:", error);

res.status(500).json({
success:false,
message:error.message
});

}

};
