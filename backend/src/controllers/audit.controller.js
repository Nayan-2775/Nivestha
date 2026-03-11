import pool from "../config/db.js";

export const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.log_id, a.action, a.entity, a.entity_id, a.details, a.created_at,
              u.email as performed_by
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.user_id
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching audit logs" });
  }
};
