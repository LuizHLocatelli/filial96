import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DialogScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogScrollableContainer = React.forwardRef<
  HTMLDivElement,
  DialogScrollableContainerProps
>(({ children, className }, ref) => {
  const isMobile = useIsMobile();

  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6",
        className
      )}
      data-scroll-lock-ignore
      style={{
        maxHeight: isMobile ? 'calc(75dvh - 260px)' : 'calc(75vh - 260px)'
      }}
    >
      {children}
    </div>
  );
});

DialogScrollableContainer.displayName = "DialogScrollableContainer";
