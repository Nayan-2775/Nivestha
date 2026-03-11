import pool from "../config/db.js";

export const requireRole = (roleName) => {
  return async (req, res, next) => {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT r.role_name
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );

    const roles = result.rows.map(r => r.role_name);

    if (!roles.includes(roleName)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
