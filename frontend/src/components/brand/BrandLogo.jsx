import React from "react";

export function BrandMark({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M5 21.5h12.2V42H5V21.5Z" fill="#10264A" />
      <path d="M18.8 13h12.4v29H18.8V13Z" fill="#C9A34E" />
      <path d="M32.6 25.5H43V42H32.6V25.5Z" fill="#2F6847" />
      <path d="M8.2 25.2h2.2v2.2H8.2v-2.2Zm4.1 0h2.2v2.2h-2.2v-2.2ZM8.2 30h2.2v2.2H8.2V30Zm4.1 0h2.2v2.2h-2.2V30Z" fill="#fff" fillOpacity=".9" />
      <path d="M22.1 17h2.2v2.2h-2.2V17Zm4 0h2.2v2.2h-2.2V17Zm-4 4.8h2.2V24h-2.2v-2.2Zm4 0h2.2V24h-2.2v-2.2Zm-4 4.8h2.2v2.2h-2.2v-2.2Zm4 0h2.2v2.2h-2.2v-2.2Z" fill="#fff" fillOpacity=".9" />
      <path d="M8 19 18.3 9.8l6.4 5.7L38.4 5.5" stroke="#2F6847" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m33.8 5.9 5.1-.8-.7 5.1" stroke="#2F6847" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BrandLogo({ className = "", compact = false }) {
  return (
    <span className={`brand-logo ${compact ? "brand-logo-compact" : ""} ${className}`.trim()}>
      <span className="brand-logo-mark-wrap"><BrandMark className="brand-logo-mark" /></span>
      <span className="brand-logo-copy">
        <span className="brand-logo-name">NI<span>V</span>ESTHA</span>
        <span className="brand-logo-tagline">FRACTIONAL REAL ESTATE</span>
      </span>
    </span>
  );
}
