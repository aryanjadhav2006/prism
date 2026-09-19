import React from "react";

export default function PrismLogo({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="prismGradientLeft" x1="12" y1="2" x2="3" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="prismGradientRight" x1="12" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="prismBase" x1="3" y1="20" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="rayCyan" x1="12" y1="12" x2="23" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="rayPurple" x1="12" y1="12" x2="23" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="rayPink" x1="12" y1="12" x2="23" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Incident White Light Beam */}
      <path
        d="M1 12 L12 12"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Triangular Prism Facet - Left */}
      <polygon
        points="12,3 4,20 12,17"
        fill="url(#prismGradientLeft)"
        opacity="0.95"
      />

      {/* Triangular Prism Facet - Right */}
      <polygon
        points="12,3 12,17 20,20"
        fill="url(#prismGradientRight)"
        opacity="0.95"
      />

      {/* Triangular Prism Base */}
      <polygon
        points="4,20 12,17 20,20"
        fill="url(#prismBase)"
        opacity="0.75"
      />

      {/* Central Ridge Highlight */}
      <line
        x1="12"
        y1="3"
        x2="12"
        y2="17"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Outer Glow Outline */}
      <polygon
        points="12,3 4,20 20,20"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinejoin="round"
        opacity="0.3"
      />

      {/* Dispersed / Refracted Rays Exiting Prism */}
      <path
        d="M12 12 L22 7"
        stroke="url(#rayCyan)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 12 L23 12"
        stroke="url(#rayPurple)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 12 L22 17"
        stroke="url(#rayPink)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
