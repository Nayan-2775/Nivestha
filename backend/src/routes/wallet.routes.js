import express from "express";

import authenticate from "../middleware/authenticate.js";

import authorizeRole from "../middleware/authorizeRole.js";

import {

getWallet,
depositMoney,
withdrawMoney,
getTransactions,
getWalletStats

} from "../controllers/wallet.controller.js";


const router = express.Router();



router.get(
"/",
authenticate,
authorizeRole("INVESTOR", "ADMIN"),
getWallet
);


router.post(
"/deposit",
authenticate,
authorizeRole("INVESTOR"),
depositMoney
);


router.post(
"/withdraw",
authenticate,
authorizeRole("INVESTOR"),
withdrawMoney
);


router.get(
"/transactions",
authenticate,
authorizeRole("INVESTOR"),
getTransactions
);

router.get(
"/stats",
authenticate,
getWalletStats
);

export default router;