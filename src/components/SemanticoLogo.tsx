import React from "react";

interface SemanticoLogoProps {
  variant?: "dark" | "light"; // dark = black text, light = white text
  className?: string;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Exact vector recreation of the Semântico knowledge graph mark:
 * - 1 central hub node
 * - 5 spokes radiating outwards at precise angles:
 *   1. Top-Left: Large accent node in brand yellow (#fdd910)
 *   2. Top-Right: Medium white node
 *   3. Bottom-Left: Small white node
 *   4. Bottom-Center: Medium-large white node
 *   5. Bottom-Right: Large white node
 * - Bold black connection lines (stroke-width 8px) with rounded caps
 */
export const SemanticoSymbol: React.FC<{
  size?: number;
  className?: string;
  isLight?: boolean;
}> = ({ size = 36, className = "", isLight = false }) => {
  const strokeColor = isLight ? "#ffffff" : "#000000";
  const nodeFill = isLight ? "#1e1b24" : "#ffffff";
  const yellowFill = "#fdd910";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Semântico Logo Symbol"
    >
      {/* 5 Spoke Lines radiating from center (cx: 50, cy: 50) */}
      {/* 1. Top-Left Spoke */}
      <line x1="50" y1="50" x2="16" y2="16" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
      
      {/* 2. Top-Right Spoke */}
      <line x1="50" y1="50" x2="80" y2="20" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
      
      {/* 3. Bottom-Left Spoke */}
      <line x1="50" y1="50" x2="22" y2="76" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
      
      {/* 4. Bottom-Center Spoke */}
      <line x1="50" y1="50" x2="50" y2="88" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
      
      {/* 5. Bottom-Right Spoke */}
      <line x1="50" y1="50" x2="88" y2="86" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />

      {/* Center Hub Node */}
      <circle cx="50" cy="50" r="14" fill={nodeFill} stroke={strokeColor} strokeWidth="8" />

      {/* 1. Top-Left Signature Yellow Node */}
      <circle cx="16" cy="16" r="11.5" fill={yellowFill} stroke={strokeColor} strokeWidth="8" />

      {/* 2. Top-Right Secondary Node */}
      <circle cx="80" cy="20" r="7.5" fill={nodeFill} stroke={strokeColor} strokeWidth="7" />

      {/* 3. Bottom-Left Small Node */}
      <circle cx="22" cy="76" r="8" fill={nodeFill} stroke={strokeColor} strokeWidth="7" />

      {/* 4. Bottom-Center Node */}
      <circle cx="50" cy="88" r="10.5" fill={nodeFill} stroke={strokeColor} strokeWidth="8" />

      {/* 5. Bottom-Right Large Node */}
      <circle cx="88" cy="86" r="11" fill={nodeFill} stroke={strokeColor} strokeWidth="8" />
    </svg>
  );
};

export const SemanticoLogo: React.FC<SemanticoLogoProps> = ({
  variant = "dark",
  className = "",
  showSubtitle = true,
  size = "md",
}) => {
  const isLight = variant === "light";
  const textColor = isLight ? "#ffffff" : "#000000";

  const sizeConfigs = {
    sm: { symbolSize: 28, textClass: "text-lg", tagClass: "text-[8px] py-0.5 px-1.5" },
    md: { symbolSize: 36, textClass: "text-xl", tagClass: "text-[9px] py-0.5 px-2" },
    lg: { symbolSize: 46, textClass: "text-2xl", tagClass: "text-[10px] py-1 px-2.5" },
  };

  const current = sizeConfigs[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Vector Symbol */}
      <SemanticoSymbol size={current.symbolSize} isLight={isLight} />

      {/* Wordmark + Tag */}
      <div className="flex flex-col justify-center">
        <span
          style={{ color: textColor }}
          className={`font-black tracking-tight leading-none ${current.textClass}`}
        >
          Semântico
        </span>

        {showSubtitle && (
          <div className="mt-1 flex">
            <span
              className={`bg-[#fdd910] text-[#000000] font-black uppercase tracking-widest rounded-xs leading-tight ${current.tagClass} shadow-2xs`}
              style={{ letterSpacing: "0.14em" }}
            >
              Significado e Sentido
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
