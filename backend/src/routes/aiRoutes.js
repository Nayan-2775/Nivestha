import express from "express";
import authenticate from "../middleware/authenticate.js";
import { predictProperty } from "../controllers/aiController.js";

const router = express.Router();

router.post(
"/predict",
authenticate,
predictProperty
);

export default router;