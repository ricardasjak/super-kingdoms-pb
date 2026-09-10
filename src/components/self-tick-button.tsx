import React, { useState } from "react";
import { pb } from "../lib/pocketbase";

export interface SelfTickButtonProps {
  newbiemode?: number;
  gamePhase?: string | null;
  onError?: (msg: string) => void;
  onSuccess?: (msg: string | null) => void;
  showText?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SelfTickButton: React.FC<SelfTickButtonProps> = ({
  newbiemode,
  gamePhase,
  onError,
  onSuccess,
  showText = true,
  className = "",
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const remaining = newbiemode ?? 0;
  const phaseOk = gamePhase === "registration" || gamePhase === "in-progress";
  const budgetOk = remaining >= 8;
  const disabled = isLoading || !phaseOk || !budgetOk;

  const title = !phaseOk
    ? `Self-tick runs only during registration or in-progress (now: ${gamePhase ?? "unknown"})`
    : !budgetOk
      ? "Newbie mode exhausted — no self-ticks remaining"
      : `Advance your kingdom 8 ticks (${remaining} newbie ticks left)`;

  const handleSelfTick = async () => {
    if (onError) onError("");
    if (onSuccess) onSuccess(null);
    setIsLoading(true);

    try {
      const response = await pb.send<{
        success: boolean;
        ticksAdvanced: number;
        newbiemode: number;
      }>("/api/kingdoms/self-tick", {
        method: "POST",
      });

      window.dispatchEvent(new CustomEvent("tick-advanced", { detail: response }));
      if (onSuccess) {
        onSuccess(`Advanced your kingdom ${response.ticksAdvanced} ticks`);
      }
    } catch (error: unknown) {
      console.error("Failed to self-tick:", error);
      let msg = "Failed to self-tick";
      if (error && typeof error === "object" && "data" in error) {
        const errorData = (error as { data?: { error?: string } }).data;
        if (errorData?.error) {
          msg = errorData.error;
        }
      } else if (error instanceof Error) {
        msg = error.message;
      }
      if (onError) {
        onError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSelfTick}
      disabled={disabled}
      aria-busy={isLoading}
      className={`btn btn-primary ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        padding: "0.35rem 0.75rem",
        fontSize: "0.85rem",
        cursor: disabled ? "not-allowed" : isLoading ? "wait" : "pointer",
        ...style,
      }}
      title={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
      >
        <title>Self-Tick 8 Ticks</title>
        <polygon points="3 3 11 12 3 21 3 3" />
        <polygon points="11 3 21 12 11 21 11 3" />
      </svg>
      {showText && <span>{isLoading ? "Self-ticking..." : `Self-Tick +8 (${remaining} left)`}</span>}
    </button>
  );
};
