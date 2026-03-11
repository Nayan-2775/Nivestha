import pool from "../config/db.js";

/**
 * GET user notifications
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const result = await pool.query(
            `SELECT notification_id, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error retrieving notifications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { id } = req.params;

        // // Validate UUID format
        // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        // if (!uuidRegex.test(id)) {
        //     return res.status(400).json({ message: "Invalid notification ID format" });
        // }

        const result = await pool.query(
            `UPDATE notifications
       SET is_read = true
       WHERE notification_id = $1 AND user_id = $2
       RETURNING notification_id`,
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
