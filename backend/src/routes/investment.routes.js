import express from "express";

import authenticate from "../middleware/authenticate.js";

import authorizeRole from "../middleware/authorizeRole.js";

import {

investInProperty,

getMyInvestments

} from "../controllers/investment.controller.js";


const router = express.Router();


router.post(
"/",
authenticate,
authorizeRole("INVESTOR"),
investInProperty
);

router.get(
"/my",
authenticate,
authorizeRole("INVESTOR"),
getMyInvestments
);

export default router;