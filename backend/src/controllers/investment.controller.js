import pool from "../config/db.js";
import auditLog from "../utils/auditLog.js";

/**
 * =====================================================
 * INVEST IN PROPERTY
 * =====================================================
 */
export const investInProperty = async (req, res) => {

  const userId = req.user?.user_id;

  const { property_id, shares } = req.body;


  if (!userId) {

    return res.status(401).json({
      success: false,
      message: "Unauthorized user"
    });

  }


  if (!property_id || !shares || shares <= 0) {

    return res.status(400).json({
      success: false,
      message: "Invalid input"
    });

  }



  const client = await pool.connect();



  try {

    await client.query("BEGIN");



    /**
     * 1. Lock property row
     */
    const propertyResult = await client.query(

      `
      SELECT
      title,
      total_value,
      total_shares,
      available_shares
      FROM properties
      WHERE property_id=$1
      AND status='open'
      FOR UPDATE
      `,

      [property_id]

    );


    if (propertyResult.rowCount === 0) {

      throw new Error("Property not available");

    }


    const property = propertyResult.rows[0];



    if (shares > property.available_shares) {

      throw new Error("Not enough shares available");

    }



    /**
     * 2. Calculate amount
     */
    const pricePerShare =
      Number(property.total_value) /
      Number(property.total_shares);


    const investmentAmount =
      pricePerShare * Number(shares);



    /**
     * 3. Lock wallet
     */
    const walletResult = await client.query(

      `
      SELECT
      wallet_id,
      COALESCE(NULLIF(balance::text,'NaN')::numeric,0) AS balance
      FROM wallets
      WHERE user_id=$1
      FOR UPDATE
      `,

      [userId]

    );


    if (walletResult.rowCount === 0) {

      throw new Error("Wallet not found");

    }


    const wallet = walletResult.rows[0];



    if (Number(wallet.balance) < investmentAmount) {

      throw new Error("Insufficient balance");

    }



    /**
     * 4. Deduct balance
     */
    await client.query(

      `
      UPDATE wallets
      SET balance = COALESCE(NULLIF(balance::text,'NaN')::numeric,0) - $1
      WHERE wallet_id=$2
      `,

      [investmentAmount, wallet.wallet_id]

    );



    /**
     * 5. Reduce shares
     */
    await client.query(

      `
      UPDATE properties
      SET available_shares =
      available_shares - $1
      WHERE property_id=$2
      `,

      [shares, property_id]

    );



    /**
     * 6. Insert or update investment
     */
    const checkInvestment =
      await client.query(

        `
        SELECT investment_id
        FROM investments
        WHERE user_id=$1
        AND property_id=$2
        `,

        [userId, property_id]

      );


    if (checkInvestment.rowCount === 0) {

      await client.query(

        `
        INSERT INTO investments
        (user_id,property_id,shares,amount_invested)
        VALUES($1,$2,$3,$4)
        `,

        [
          userId,
          property_id,
          shares,
          investmentAmount
        ]

      );

    }

    else {

      await client.query(

        `
        UPDATE investments
        SET shares = shares + $1,
        amount_invested = amount_invested + $2
        WHERE investment_id=$3
        `,

        [
          shares,
          investmentAmount,
          checkInvestment.rows[0].investment_id
        ]

      );

    }



    /**
     * 7. Transaction record
     */
    await client.query(

      `
      INSERT INTO transactions
      (wallet_id,user_id,property_id,type,amount)
      VALUES($1,$2,$3,'investment',$4)
      `,

      [
        wallet.wallet_id,
        userId,
        property_id,
        investmentAmount
      ]

    );



    /**
     * 8. Notification
     */
    await client.query(

      `
      INSERT INTO notifications
      (user_id,message)
      VALUES($1,$2)
      `,

      [
        userId,
        `You invested in ${property.title}`
      ]

    );



    /**
     * 9. Audit log
     */
    await auditLog(

      userId,

      "INVESTMENT",

      "PROPERTY",

      property_id,

      {

        shares,

        amount: investmentAmount

      }

    );



    await client.query("COMMIT");



    res.status(201).json({

      success: true,

      message: "Investment successful",

      property: property.title,

      shares,

      amount: investmentAmount

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
 * =====================================================
 * GET MY INVESTMENTS (PORTFOLIO)
 * =====================================================
 */
export const getMyInvestments = async (req, res) => {

  try {

    const result = await pool.query(

      `
      SELECT

      i.investment_id,

      p.property_id,

      p.title,

      p.location,

      i.shares,

      i.amount_invested,

      i.created_at,

      -- calculate share price
      ROUND(p.total_value / p.total_shares,2) AS share_price,

      -- current value
      ROUND((p.total_value / p.total_shares) * i.shares,2) AS current_value,

      -- rent earned (realized return)
      COALESCE(
        (
          SELECT SUM(t.amount)
          FROM transactions t
          WHERE t.user_id = i.user_id
          AND t.property_id = i.property_id
          AND t.type = 'rental_income'
        ),
      0) AS rent_earned,

      -- unrealized profit (market movement only)
      ROUND(
        ((p.total_value / p.total_shares) * i.shares) - i.amount_invested,
      2) AS unrealized_profit,

      -- total profit = unrealized + realized rent
      ROUND(
        (
          ((p.total_value / p.total_shares) * i.shares) - i.amount_invested
        ) +
        COALESCE(
          (
            SELECT SUM(t.amount)
            FROM transactions t
            WHERE t.user_id = i.user_id
            AND t.property_id = i.property_id
            AND t.type = 'rental_income'
          ),
        0),
      2) AS profit,

      -- ROI percentage (based on total profit)
      ROUND(
        (
          (
            (
              ((p.total_value / p.total_shares) * i.shares)
              - i.amount_invested
            ) +
            COALESCE(
              (
                SELECT SUM(t.amount)
                FROM transactions t
                WHERE t.user_id = i.user_id
                AND t.property_id = i.property_id
                AND t.type = 'rental_income'
              ),
            0)
          )
          /
          i.amount_invested
        ) * 100
      ,2) AS roi,

      -- property image
      (
        SELECT image_url
        FROM property_images
        WHERE property_id = p.property_id
        AND is_primary = true
        LIMIT 1
      ) AS property_image

      FROM investments i

      JOIN properties p
      ON p.property_id = i.property_id

      WHERE i.user_id = $1

      ORDER BY i.created_at DESC
      `,

      [req.user.user_id]

    );



    const portfolio = result.rows.map(item => ({

      ...item,

      property_image:
        item.property_image
        ? `${process.env.BASE_URL}/uploads/${item.property_image}`
        : null

    }));



    res.json({

      success: true,

      portfolio

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
 * =====================================================
 * DASHBOARD - INVESTMENTS SUMMARY
 * =====================================================
 */

export const getDashboardStats = async (req, res) => {

  try {

    const userId = req.user.user_id;

    const wallet = await pool.query(
      `
      SELECT COALESCE(NULLIF(balance::text,'NaN')::numeric,0) AS balance
      FROM wallets
      WHERE user_id=$1
      `,
      [userId]
    );

    const investments = await pool.query(
      `
      SELECT
      SUM(amount_invested) as total_invested,
      COUNT(*) as properties
      FROM investments
      WHERE user_id=$1
      `,
      [userId]
    );

    const transactions = await pool.query(
      `
      SELECT
      DATE_TRUNC('month', created_at) as month,
      SUM(amount) as value
      FROM transactions
      WHERE user_id=$1
      GROUP BY month
      ORDER BY month
      `,
      [userId]
    );

    res.json({
      success:true,
      wallet:wallet.rows[0],
      investments:investments.rows[0],
      growth:transactions.rows
    });

  } catch(err){

    res.status(500).json({
      success:false,
      message:err.message
    });

  }

};
