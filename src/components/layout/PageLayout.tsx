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
  maxWidth = "xl",
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
    full: "max-w-full"
  };

  const spacingClasses = {
    tight: "space-y-1.5 sm:space-y-2",
    normal: "space-y-2.5 sm:space-y-4",
    relaxed: "space-y-4 sm:space-y-6"
  };

  const paddingClasses = {
    tight: "px-3 sm:px-4 py-2 sm:py-3",
    normal: "px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5",
    relaxed: "px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
  };

  return (
    <div className={cn(
      "w-full mx-auto animate-fade-in",
      fullHeight && "min-h-screen",
      spacingClasses[spacing],
      maxWidthClasses[maxWidth],
      paddingClasses[spacing],
      "relative",
      maxWidth === "full" ? "w-full" : "w-full",
      className
    )}>
      {children}
    </div>
  );
} 