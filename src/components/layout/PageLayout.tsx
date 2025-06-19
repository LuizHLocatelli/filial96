
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  spacing?: "tight" | "normal" | "relaxed";
  className?: string;
  fullHeight?: boolean;
}

export function PageLayout({
  children,
  maxWidth = "full",
  spacing = "normal",
  className,
  fullHeight = false
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    "2xl": "max-w-screen-2xl",
    full: "w-full"
  };

  const spacingClasses = {
    tight: "space-y-2 sm:space-y-3",
    normal: "space-y-3 sm:space-y-4",
    relaxed: "space-y-4 sm:space-y-6"
  };

  const paddingClasses = {
    tight: "px-4 py-3",
    normal: "px-4 py-4",
    relaxed: "px-6 py-6"
  };

  return (
    <div className={cn(
      "w-full animate-fade-in",
      fullHeight && "min-h-screen",
      spacingClasses[spacing],
      maxWidthClasses[maxWidth],
      paddingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}
