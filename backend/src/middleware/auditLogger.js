import pool from "../config/db.js";

export const auditLog = async (userId, action, entity, entityId = null, details = null) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, entity, entityId, details]
    );
  } catch (err) {
    console.error("Audit Log error:", err.message);
  }
};
