import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { glassButtonVariants } from "./glassButtonVariants";
import type { VariantProps } from "class-variance-authority";

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
          <div className="absolute inset-0 rounded-xl opacity-80" />
          
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-xl" />
          
          {glow && (
            <div className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none bg-current" />
          )}
          
          <div className="relative z-10 flex items-center gap-2">
            {children}
          </div>
          
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

export { GlassButton };
