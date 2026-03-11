import express from "express";

import {

 register,
 login

} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate);

export default router;