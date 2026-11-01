import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../brand/BrandLogo";

export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const links = isAdmin
    ? [
        { to: "/admin/dashboard", label: "Dashboard" },
        { to: "/admin/users", label: "Users" },
        { to: "/admin/properties", label: "Properties" },
        { to: "/admin/rent-distribution", label: "Rent distribution" }
      ]
    : [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/wallet", label: "Wallet" },
        { to: "/investments", label: "Investments" },
        { to: "/portfolio", label: "Portfolio" }
      ];

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-main-row">
          <NavLink to="/" className="footer-brand" aria-label="Nivestha home">
            <BrandLogo />
          </NavLink>
          <p className="footer-description">
            Build your future with accessible, fractional real estate investing.
          </p>
          <nav className="footer-navigation" aria-label="Footer navigation">
            <p className="footer-nav-heading">Explore Nivestha</p>
            <div className="footer-nav-links">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
              ))}
            </div>
          </nav>
        </div>
        <div className="footer-bottom-row">
          <span>© {new Date().getFullYear()} Nivestha</span>
          <span>Property ownership, made more accessible.</span>
        </div>
      </div>
    </footer>
  );
}
