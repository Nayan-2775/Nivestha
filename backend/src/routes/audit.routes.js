import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authenticate, requireRole("ADMIN"), getAuditLogs);

export default router;
