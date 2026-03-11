import express from "express";
import { getUserTransactions } from "../controllers/transaction.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// GET /api/transactions
router.get("/", authenticate, getUserTransactions);

export default router;