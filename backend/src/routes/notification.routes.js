import express from "express";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { validateUUIDParam } from "../middleware/validate.js";

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for logged-in user
 * @access  Private
 */
router.get(
  "/",
  authenticate,
  getNotifications
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch(
  "/:id/read",
  authenticate,
  ...validateUUIDParam("id"),  // IMPORTANT: spread operator
  markAsRead
);

export default router;
