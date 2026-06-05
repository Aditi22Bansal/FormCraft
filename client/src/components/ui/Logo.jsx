import React from 'react';

export default function Logo({ className = "w-8 h-8", size = 32 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="logo-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#6366F1" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Outer base pill shape */}
      <rect x="2.5" y="2.5" width="27" height="27" rx="8" fill="url(#logo-grad-2)" fillOpacity="0.08" stroke="#E4E4E7" strokeWidth="1" />
      
      {/* Logo Graphic */}
      <g filter="url(#logo-glow)">
        {/* Back Form Document */}
        <rect x="8" y="7" width="11" height="15" rx="2" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="1.5" />
        <line x1="11" y1="11" x2="16" y2="11" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="11" y1="14" x2="14" y2="14" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />
        
        {/* Front Form Document (Glow/Active) */}
        <rect x="13" y="11" width="11" height="14" rx="2" fill="url(#logo-grad-1)" />
        <line x1="16" y1="15" x2="21" y2="15" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="18" x2="19" y2="18" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="21" x2="20" y2="21" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        
        {/* Active connection node */}
        <circle cx="21" cy="9" r="2.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
      </g>
    </svg>
  );
}
