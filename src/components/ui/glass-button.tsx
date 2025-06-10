
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium glass-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-primary-foreground shadow-lg",
        primary: "text-white shadow-lg glass-primary",
        secondary: "text-foreground shadow-md glass-secondary",
        accent: "text-white shadow-lg glass-accent",
        outline: "border-2 border-glass-border text-foreground shadow-md",
        ghost: "text-foreground hover:bg-white/10",
        success: "text-white shadow-lg bg-green-500/20 border-green-400/30",
        warning: "text-white shadow-lg bg-yellow-500/20 border-yellow-400/30",
        destructive: "text-white shadow-lg bg-red-500/20 border-red-400/30"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8",
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
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Comp
          className={cn(glassButtonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
          
          {/* Glass Shine Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </Comp>
      </motion.div>
    );
  }
);

GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
