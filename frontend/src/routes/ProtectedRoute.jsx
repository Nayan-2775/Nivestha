import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

export default function ProtectedRoute({ children, role }) {

const { token } = useAuth();
const userRole = localStorage.getItem("role");

if (!token) {
return <Navigate to="/login" />;
}

if (role && userRole !== role) {
return <Navigate to="/dashboard" />;
}

return children;

}