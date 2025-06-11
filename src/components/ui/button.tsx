
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "glass-button glass-primary text-primary-foreground shadow-lg hover:shadow-xl",
        destructive: "glass-button bg-red-500/20 border-red-400/30 text-red-100 hover:bg-red-500/30",
        outline: "glass-button border-2 border-white/20 text-foreground hover:border-white/40",
        secondary: "glass-button glass-secondary text-secondary-foreground shadow-md hover:shadow-lg",
        ghost: "glass-button bg-transparent hover:bg-white/10 text-foreground",
        link: "text-primary underline-offset-4 hover:underline bg-transparent",
        gradient: "glass-button glass-primary text-primary-foreground shadow-xl hover:shadow-2xl",
        glass: "glass-button glass-accent text-white shadow-lg hover:shadow-xl",
        success: "glass-button bg-green-500/20 border-green-400/30 text-green-100 hover:bg-green-500/30",
        warning: "glass-button bg-yellow-500/20 border-yellow-400/30 text-yellow-100 hover:bg-yellow-500/30"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs font-medium",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    const buttonContent = (
      <>
        {/* Glass Shine Effect for small buttons */}
        {size === "sm" && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        )}
        
        {/* Glass Shine Effect for other buttons */}
        {size !== "sm" && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        )}
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        
        {/* Bottom Highlight - removido para botões pequenos no modo escuro */}
        {!(size === "sm") && (
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          )} />
        )}
      </>
    );

    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size, className }),
            isMobile && "min-h-[44px] rounded-2xl", // Touch target for mobile
            size === "sm" && [
              "glass-button-default",
              "shadow-sm hover:shadow-md",
              "border border-white/15 hover:border-white/25",
              "backdrop-blur-sm",
              "transition-all duration-200 ease-out",
              // Correção específica para botões pequenos no modo escuro
              "dark:border-white/8 dark:hover:border-white/15",
              "relative overflow-hidden"
            ]
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    
    // Filter out conflicting props that have different signatures between HTML and Framer Motion
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
        whileHover={{ scale: size === "sm" ? 1.03 : 1.02 }}
        whileTap={{ scale: size === "sm" ? 0.97 : 0.98 }}
        transition={{ duration: 0.1 }}
        className={cn(
          buttonVariants({ variant, size, className }),
          isMobile && "min-h-[44px] rounded-2xl", // Touch target for mobile
          size === "sm" && [
            "glass-button-default",
            "shadow-sm hover:shadow-md",
            "border border-white/15 hover:border-white/25",
            "backdrop-blur-sm",
            "transition-all duration-200 ease-out",
            // Correção específica para botões pequenos no modo escuro
            "dark:border-white/8 dark:hover:border-white/15",
            "relative overflow-hidden"
          ]
        )}
        ref={ref}
        {...buttonProps}
      >
        {buttonContent}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
