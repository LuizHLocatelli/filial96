
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "glass-button-default text-foreground shadow-xl border border-white/20 dark:border-white/10",
        primary: "glass-button-primary text-white shadow-2xl border border-green-400/30",
        secondary: "glass-button-secondary text-foreground shadow-lg border border-white/25 dark:border-white/15",
        accent: "glass-button-accent text-white shadow-2xl border border-pink-400/30",
        outline: "glass-button-outline border-2 text-foreground shadow-md hover:shadow-xl",
        ghost: "glass-button-ghost text-foreground hover:shadow-lg",
        success: "glass-button-success text-white shadow-2xl border border-green-400/40",
        warning: "glass-button-warning text-amber-900 dark:text-amber-100 shadow-xl border border-amber-400/40",
        destructive: "glass-button-destructive text-white shadow-2xl border border-red-400/40"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
  ripple?: boolean;
  glow?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, glow = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [isPressed, setIsPressed] = React.useState(false);

    return (
      <motion.div
        whileHover={{ 
          scale: 1.02,
          y: -1,
        }}
        whileTap={{ 
          scale: 0.98,
          y: 0,
        }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.15
        }}
        onTapStart={() => setIsPressed(true)}
        onTap={() => setIsPressed(false)}
        onTapCancel={() => setIsPressed(false)}
      >
        <Comp
          className={cn(glassButtonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {/* Background Gradient Layer */}
          <div className="absolute inset-0 rounded-xl opacity-80" />
          
          {/* Glass Shine Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {/* Top Highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-xl" />
          
          {/* Glow Effect */}
          {glow && (
            <div className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none bg-current" />
          )}
          
          {/* Content */}
          <div className="relative z-10 flex items-center gap-2">
            {children}
          </div>
          
          {/* Ripple Effect */}
          {ripple && isPressed && (
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-xl bg-white/20"
            />
          )}
        </Comp>
      </motion.div>
    );
  }
);

GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
