import pool from "../config/db.js";

const RANGE_CONFIG = {
  day: {
    truncUnit: "day",
    backInterval: "13 days",
    stepInterval: "1 day",
    labelFormat: "DD Mon"
  },
  week: {
    truncUnit: "week",
    backInterval: "11 weeks",
    stepInterval: "1 week",
    labelFormat: "DD Mon"
  },
  month: {
    truncUnit: "month",
    backInterval: "11 months",
    stepInterval: "1 month",
    labelFormat: "Mon YYYY"
  },
  year: {
    truncUnit: "year",
    backInterval: "4 years",
    stepInterval: "1 year",
    labelFormat: "YYYY"
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const range = RANGE_CONFIG[req.query.range] ? req.query.range : "month";
    const config = RANGE_CONFIG[range];

    const walletResult = await pool.query(
      `
      SELECT COALESCE(NULLIF(balance::text,'NaN')::numeric,0) AS balance
      FROM wallets
      WHERE user_id=$1
      `,
      [userId]
    );

    const walletBalance = Number(walletResult.rows[0]?.balance || 0);

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

    const rentResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount),0) AS total_rent_earned
      FROM transactions
      WHERE user_id=$1
      AND type='rental_income'
      `,
      [userId]
    );

    const totalRentEarned = Number(rentResult.rows[0]?.total_rent_earned || 0);

    const growthResult = await pool.query(
      `
      WITH periods AS (
        SELECT generate_series(
          date_trunc('${config.truncUnit}', CURRENT_DATE) - INTERVAL '${config.backInterval}',
          date_trunc('${config.truncUnit}', CURRENT_DATE),
          INTERVAL '${config.stepInterval}'
        ) AS period_start
      ),
      grouped_transactions AS (
        SELECT
          date_trunc('${config.truncUnit}', created_at) AS period_start,
          COALESCE(SUM(CASE WHEN type='investment' THEN amount ELSE 0 END),0) AS invested,
          COALESCE(SUM(CASE WHEN type='rental_income' THEN amount ELSE 0 END),0) AS rent_earned
        FROM transactions
        WHERE user_id=$1
        AND type IN ('investment','rental_income')
        AND created_at >= date_trunc('${config.truncUnit}', CURRENT_DATE) - INTERVAL '${config.backInterval}'
        GROUP BY date_trunc('${config.truncUnit}', created_at)
      )
      SELECT
        TO_CHAR(periods.period_start, '${config.labelFormat}') AS label,
        COALESCE(grouped_transactions.invested,0) AS invested,
        COALESCE(grouped_transactions.rent_earned,0) AS rent_earned,
        COALESCE(grouped_transactions.rent_earned,0) - COALESCE(grouped_transactions.invested,0) AS net_growth,
        periods.period_start AS sort_key
      FROM periods
      LEFT JOIN grouped_transactions
        ON grouped_transactions.period_start = periods.period_start
      ORDER BY periods.period_start
      `,
      [userId]
    );

    const growth = growthResult.rows.map((row) => ({
      label: row.label,
      invested: Number(row.invested),
      rent_earned: Number(row.rent_earned),
      net_growth: Number(row.net_growth)
    }));

    res.json({
      success: true,
      range,
      wallet: {
        balance: walletBalance
      },
      investments: {
        total_invested: totalInvested,
        properties
      },
      earnings: {
        total_rent_earned: totalRentEarned
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
