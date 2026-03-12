import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

export default function ProtectedRoute({ children, role }) {

const { token, user } = useAuth();
const userRole = user?.role;

if (!token) {
return <Navigate to="/login" />;
}

if (role && userRole !== role) {
return <Navigate to={userRole === "ADMIN" ? "/admin/dashboard" : "/dashboard"} />;
}

return children;

}
