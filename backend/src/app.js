import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import hpp from "hpp";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import investmentRoutes from "./routes/investment.routes.js";
import rentalRoutes from "./routes/rental.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import aiRoutes from "./routes/aiRoutes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";


dotenv.config();

const app = express();

app.use("/uploads",express.static(path.join(process.cwd(),"uploads")));
/* ===============================
   1️⃣ SECURITY MIDDLEWARE
================================= */

// Secure HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    credentials: true,
  })
);

// Rate limiting (prevent brute force / abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP",
});
app.use(limiter);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compress responses
app.use(compression());

// Parse JSON body
app.use(express.json({ limit: "10kb" }));

// Logging in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ===============================
   2️⃣ ROUTES
================================= */

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Nivestha backend running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/rental", rentalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);

// ✅ ADD TEST ROUTE HERE
import pool from "./config/db.js";

app.get("/api/test-db", async (req, res) => {

  try {

    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      time: result.rows[0],
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});


/* ===============================
   3️⃣ 404 HANDLER
================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ===============================
   4️⃣ GLOBAL ERROR HANDLER (LAST)
================================= */

app.use(errorHandler);

export default app;