import express from "express";
import { distributeRentIncome } from "../controllers/rental.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { distributeRent } from "../controllers/admin.controller.js";

const router = express.Router();

router.post(
  "/distribute",
  authenticate,
  requireRole("ADMIN"),
  distributeRentIncome
);

export default router;
