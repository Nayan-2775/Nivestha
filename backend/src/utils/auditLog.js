import pool from "../config/db.js";

const auditLog = async (
  userId,
  action,
  entityType,
  entityId,
  metadata
) => {

  try {

    await pool.query(
      `
      INSERT INTO audit_logs
      (user_id, action, entity_type, entity_id, metadata)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        userId,
        action,
        entityType,
        entityId,
        JSON.stringify({ message: metadata })
      ]
    );

  } catch (error) {

    console.error("Audit log error:", error.message);

  }

};

export default auditLog;