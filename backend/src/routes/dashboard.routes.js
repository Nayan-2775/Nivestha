import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
  "/stats",
  authenticate,
  getDashboardStats
);

export default router;