import pool from "../config/db.js";

export const getUserTransactions = async (req, res) => {

  try {

    const userId = req.user.user_id;

    if (!userId) {
      return res.status(401).json({
        success:false,
        message:"Unauthorized"
      });
    }

    // Get wallet first
    const walletResult = await pool.query(
      `
      SELECT wallet_id
      FROM wallets
      WHERE user_id=$1
      `,
      [userId]
    );

    if(walletResult.rows.length === 0){

      return res.json({
        success:true,
        transactions:[]
      });

    }

    const walletId = walletResult.rows[0].wallet_id;

    // Fetch transactions
    const transactionsResult = await pool.query(
      `
      SELECT
      transaction_id,
      type,
      amount,
      created_at
      FROM transactions
      WHERE wallet_id=$1
      OR (wallet_id IS NULL AND user_id=$2)
      ORDER BY created_at DESC
      `,
      [walletId, userId]
    );

    res.json({
      success:true,
      transactions:transactionsResult.rows
    });

  } 
  catch(error){

    console.log("Transaction fetch error:",error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

};
