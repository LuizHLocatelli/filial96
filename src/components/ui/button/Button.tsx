import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./buttonVariants";
import type { VariantProps } from "class-variance-authority";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ripple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    const buttonContent = (
      <>
        {variant !== "link" && variant !== "ghost" && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[inherit]" />
        )}
        
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </>
    );

    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size, className }),
            isMobile && "min-h-[44px]",
            "group"
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    
    const {
      onDrag,
      onDragEnd,
      onDragStart,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      onTransitionEnd,
      ...buttonProps
    } = props;
    
    return (
      <motion.button
        whileHover={{ scale: size === "sm" || size === "icon-sm" ? 1.02 : 1.01 }}
        whileTap={{ scale: size === "sm" || size === "icon-sm" ? 0.98 : 0.99 }}
        transition={{ duration: 0.1 }}
        className={cn(
          buttonVariants({ variant, size, className }),
          isMobile && "min-h-[44px]",
          "group"
        )}
        ref={ref}
        {...buttonProps}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
