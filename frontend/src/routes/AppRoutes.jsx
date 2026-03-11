import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* Investor Layout */
import DashboardLayout from "../components/layout/DashboardLayout";

/* Admin Layout */
import AdminLayout from "../components/admin/AdminLayout";

/* Auth Pages */
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

/* Investor Pages */
import InvestorDashboard from "../pages/Dashboard/InvestorDashboard";
import WalletPage from "../pages/Wallet/WalletPage";
import TransactionsPage from "../pages/Transactions/TransactionsPage";
import InvestmentsPage from "../pages/Investments/InvestmentsPage";
import PortfolioPage from "../pages/Portfolio/PortfolioPage";

/* Admin Pages */
import AdminDashboard from "../pages/Admin/AdminDashboard";
import UsersPage from "../pages/admin/UsersPage";
import PropertiesPage from "../pages/admin/PropertiesPage";
import RentDistributionPage from "../pages/admin/RentDistributionPage";
import AdminTransactionsPage from "../pages/admin/AdminTransactionsPage";

export default function AppRoutes() {

return (

<Routes>

{/* Public Routes */}

<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

{/* Investor Routes */}

<Route path="/" element={<DashboardLayout />}>

<Route path="dashboard" element={<InvestorDashboard />} />
<Route path="wallet" element={<WalletPage />} />
<Route path="transactions" element={<TransactionsPage />} />
<Route path="investments" element={<InvestmentsPage />} />
<Route path="portfolio" element={<PortfolioPage />} />

</Route>


{/* Admin Routes */}

<Route path="/admin" element={<AdminLayout />}>

<Route path="dashboard" element={<AdminDashboard />} />
<Route path="users" element={<UsersPage />} />
<Route path="properties" element={<PropertiesPage />} />
<Route path="rent-distribution" element={<RentDistributionPage />} />
<Route path="transactions" element={<AdminTransactionsPage />} />

</Route>


{/* Default Redirect */}

<Route path="*" element={<Navigate to="/login" />} />

</Routes>

);

}