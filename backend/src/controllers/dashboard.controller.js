import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {

  try {

    const userId = req.user.user_id;

    /* Wallet balance (NaN safe) */
    const walletResult = await pool.query(
      `
      SELECT COALESCE(NULLIF(balance::text,'NaN')::numeric,0) AS balance
      FROM wallets
      WHERE user_id=$1
      `,
      [userId]
    );

    const walletBalance = Number(walletResult.rows[0]?.balance || 0);

    /* Total investment + properties count */
    const investmentResult = await pool.query(
      `
      SELECT
      COALESCE(SUM(amount_invested),0) AS total_invested,
      COUNT(*) AS properties
      FROM investments
      WHERE user_id=$1
      `,
      [userId]
    );

    const totalInvested = Number(investmentResult.rows[0]?.total_invested || 0);
    const properties = Number(investmentResult.rows[0]?.properties || 0);

    /* Portfolio growth for chart */
    const growthResult = await pool.query(
      `
      SELECT
      TO_CHAR(DATE_TRUNC('month', created_at),'YYYY-MM') AS month,
      COALESCE(SUM(amount),0) AS value
      FROM transactions
      WHERE user_id=$1
      AND type='investment'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
      `,
      [userId]
    );

    const growth = growthResult.rows.map(g => ({
      month: g.month,
      value: Number(g.value)
    }));

    res.json({
      success: true,
      wallet: {
        balance: walletBalance
      },
      investments: {
        total_invested: totalInvested,
        properties: properties
      },
      growth
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};
