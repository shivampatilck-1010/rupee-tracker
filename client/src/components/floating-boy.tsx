import React from 'react';

const FloatingRupee: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="animate-bounce">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animation keyframes defined in CSS */}
          <style>
            {`
              @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-30px); }
                60% { transform: translateY(-15px); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
              @keyframes glow {
                0%, 100% { filter: drop-shadow(0 0 5px rgba(147, 51, 234, 0.5)); }
                50% { filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.8)); }
              }
              .animate-bounce {
                animation: bounce 2s infinite;
              }
              .animate-pulse {
                animation: pulse 3s ease-in-out infinite;
              }
              .animate-glow {
                animation: glow 2s ease-in-out infinite;
              }
            `}
          </style>

          {/* Rounded square background */}
          <rect
            x="10"
            y="10"
            width="100"
            height="100"
            rx="20"
            ry="20"
            fill="url(#gradient)"
            stroke="#1a1a1a"
            strokeWidth="3"
            className="animate-glow"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Indian Rupee Symbol (₹) */}
          <text
            x="60"
            y="75"
            fontSize="48"
            fontWeight="bold"
            fill="#ffffff"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            ₹
          </text>

          {/* Decorative elements */}
          <circle cx="30" cy="30" r="3" fill="#ffffff" opacity="0.8" />
          <circle cx="90" cy="30" r="3" fill="#ffffff" opacity="0.8" />
          <circle cx="30" cy="90" r="3" fill="#ffffff" opacity="0.8" />
          <circle cx="90" cy="90" r="3" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
};

export default FloatingRupee;
