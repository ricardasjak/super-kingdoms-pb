import React, { useState } from "react";
import { useKingdom } from "../hooks/use-kingdom.hook";
import { Power } from "lucide-react";

export interface AutoBuildToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AutoBuildToggle: React.FC<AutoBuildToggleProps> = ({
  className = "",
  style,
}) => {
  const { kingdom, toggleAutoBuild } = useKingdom();
  const [isToggling, setIsToggling] = useState(false);

  const isEnabled = kingdom?.autoBuild ?? false;

  const handleClick = async () => {
    if (isToggling) return;
    try {
      setIsToggling(true);
      await toggleAutoBuild(!isEnabled);
    } catch (err) {
      console.error("Failed to toggle auto-build:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isToggling}
      className={`auto-build-toggle-chip ${className}`}
      title={
        isEnabled
          ? "Autonomous Governor is ON — Click to disable"
          : "Autonomous Governor is OFF — Click to enable"
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0.3rem 0.65rem",
        borderRadius: "9999px",
        fontSize: "0.8rem",
        fontWeight: 500,
        textDecoration: "none",
        transition: "all 0.2s ease-in-out",
        cursor: isToggling ? "wait" : "pointer",
        lineHeight: 1.4,
        background: isEnabled
          ? "rgba(16, 185, 129, 0.12)"
          : "rgba(255, 255, 255, 0.05)",
        border: isEnabled
          ? "1px solid rgba(16, 185, 129, 0.35)"
          : "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
        color: isEnabled
          ? "var(--accent-emerald, #10b981)"
          : "var(--text-secondary, #94a3b8)",
        backdropFilter: "blur(6px)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <Power
        size={13}
        style={{
          flexShrink: 0,
          color: isEnabled
            ? "var(--accent-emerald, #10b981)"
            : "var(--text-muted, #64748b)",
        }}
      />
      <span style={{ color: "var(--text-muted, #64748b)", fontSize: "0.75rem" }}>
        Auto:
      </span>
      {/* Switch Track */}
      <span
        style={{
          display: "inline-block",
          width: "26px",
          height: "15px",
          borderRadius: "9999px",
          background: isEnabled
            ? "var(--accent-emerald, #10b981)"
            : "rgba(255, 255, 255, 0.15)",
          position: "relative",
          transition: "background 0.2s ease-in-out",
          flexShrink: 0,
        }}
      >
        {/* Switch Thumb */}
        <span
          style={{
            position: "absolute",
            top: "1.5px",
            left: "1.5px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
            transform: isEnabled ? "translateX(11px)" : "translateX(0)",
            transition: "transform 0.2s ease-in-out",
          }}
        />
      </span>
      <span
        style={{
          fontWeight: 700,
          fontSize: "0.75rem",
          color: isEnabled ? "var(--accent-emerald, #10b981)" : "var(--text-muted, #64748b)",
        }}
      >
        {isEnabled ? "ON" : "OFF"}
      </span>
    </button>
  );
};
