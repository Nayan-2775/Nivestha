import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";

const ALLOWED_ROLES = ["INVESTOR", "ADMIN"];

// ===============================
// REGISTER USER
// ===============================
export const register = async (req, res) => {
  const {
    full_name,
    email,
    password,
    phone_number,
    role
  } = req.body;

  const requestedRole = typeof role === "string"
    ? role.toUpperCase()
    : "INVESTOR";

  if (!full_name || !email || !password) {
    return res.status(400).json({
      message: "Full name, email and password are required"
    });
  }

  if (!ALLOWED_ROLES.includes(requestedRole)) {
    return res.status(400).json({
      message: "Invalid account type selected"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      `SELECT user_id FROM users WHERE email=$1`,
      [email]
    );

    if (existingUser.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `
      INSERT INTO users
      (full_name,email,password_hash,phone_number)
      VALUES ($1,$2,$3,$4)
      RETURNING user_id,email,full_name
      `,
      [full_name, email, password_hash, phone_number || null]
    );

    const user = userResult.rows[0];

    const roleResult = await client.query(
      `
      INSERT INTO user_roles(user_id,role_id)
      SELECT $1, role_id
      FROM roles
      WHERE role_name=$2
      RETURNING user_id
      `,
      [user.user_id, requestedRole]
    );

    if (roleResult.rowCount === 0) {
      throw new Error("Selected role is not configured in database");
    }

    if (requestedRole === "INVESTOR") {
      await client.query(
        `
        INSERT INTO wallets(user_id,balance)
        VALUES($1,0)
        ON CONFLICT (user_id) DO NOTHING
        `,
        [user.user_id]
      );
    }

    await client.query("COMMIT");

    const token = signToken({
      user_id: user.user_id
    });

    res.json({
      message: "User registered successfully",
      token,
      user: {
        ...user,
        role: requestedRole
      }
    });
  }
  catch (err) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: err.message
    });
  }
  finally {
    client.release();
  }
};

// ===============================
// LOGIN USER
// ===============================
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password required"
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
      u.user_id,
      u.email,
      u.password_hash,
      u.full_name,
      r.role_name
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.user_id
      JOIN roles r ON r.role_id = ur.role_id
      WHERE u.email = $1
      `,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = signToken({
      user_id: user.user_id
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role_name
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
