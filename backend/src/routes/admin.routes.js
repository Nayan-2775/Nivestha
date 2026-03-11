import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorizeRole from "../middleware/authorizeRole.js";
import upload from "../middleware/upload.js";

import {
getDashboardStats,
getAllUsers,
getAllPropertiesAdmin,
getAllInvestments,
getAllTransactions,
getAuditLogs,
approveUser,
rejectUser,
distributeRent,
addProperty,
approveKYC,
rejectKYC
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", authenticate, authorizeRole("ADMIN"), getDashboardStats);

router.get("/users", authenticate, authorizeRole("ADMIN"), getAllUsers);

router.get("/properties", authenticate, authorizeRole("ADMIN"), getAllPropertiesAdmin);

router.get("/investments", authenticate, authorizeRole("ADMIN"), getAllInvestments);

router.get("/transactions", authenticate, authorizeRole("ADMIN"), getAllTransactions);

router.get("/audit-logs", authenticate, authorizeRole("ADMIN"), getAuditLogs);

router.put("/approve-user", authenticate, authorizeRole("ADMIN"), approveUser);

router.put("/reject-user", authenticate, authorizeRole("ADMIN"), rejectUser);

router.post(
"/distribute-rent",
authenticate,
authorizeRole("ADMIN"),
distributeRent
);

router.post("/add-property", upload.single("image"), addProperty);

router.put("/approve-kyc/:id", approveKYC);
router.put("/reject-kyc/:id", rejectKYC);


export default router;