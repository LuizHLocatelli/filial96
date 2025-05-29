import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  spacing?: "tight" | "normal" | "relaxed";
  className?: string;
}

export function PageLayout({
  children,
  maxWidth = "xl",
  spacing = "normal",
  className
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
    tight: "space-y-2",
    normal: "space-y-4",
    relaxed: "space-y-6"
  };

  const paddingClasses = {
    tight: "px-2 sm:px-4",
    normal: "px-2 sm:px-4 lg:px-6",
    relaxed: "px-4 sm:px-6 lg:px-8"
  };

  return (
    <div className={cn(
      "mx-auto animate-fade-in",
      spacingClasses[spacing],
      maxWidthClasses[maxWidth],
      paddingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
} 