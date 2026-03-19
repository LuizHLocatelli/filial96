import { memo } from "react";
import { AI_STATUS_CONFIG, type AIStatus } from "../constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: AIStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge = memo(function StatusBadge({
  status,
  showLabel = true,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const config = AI_STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all",
        config.bgColor,
        config.borderColor,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      <span className="text-base leading-none">{config.icon}</span>
      {showLabel && (
        <span className={cn("font-medium", config.color)}>{config.label}</span>
      )}
    </div>
  );
});

interface AIStatusIndicatorProps {
  status: AIStatus;
  progress?: number;
  className?: string;
}

export const AIStatusIndicator = memo(function AIStatusIndicator({
  status,
  progress,
  className,
}: AIStatusIndicatorProps) {
  if (status === "analyzing" && progress !== undefined) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress * 0.88} 88`}
              className="text-blue-500 transition-all duration-300"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-500">
            {progress}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "status-indicator",
        status === "analyzing" && "analyzing",
        status === "completed" && "success",
        status === "error" && "error",
        status === "pending" && "pending",
        className
      )}
    />
  );
});
