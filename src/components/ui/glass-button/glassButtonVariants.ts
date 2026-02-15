import { cva } from "class-variance-authority";

export const glassButtonVariants = cva(
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
