import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-2 border-primary shadow-sm hover:bg-primary/90 hover:border-primary/90 hover:shadow-md hover:-translate-y-px",
        destructive: "bg-destructive text-destructive-foreground border-2 border-destructive shadow-sm hover:bg-destructive/90 hover:border-destructive/90 hover:shadow-md hover:-translate-y-px",
        outline: "bg-background text-foreground border-2 border-border shadow-sm hover:bg-muted hover:border-border/80 hover:shadow-md dark:hover:bg-primary/25 dark:hover:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground border-2 border-secondary shadow-sm hover:bg-secondary/80 hover:border-secondary/80 hover:shadow-md hover:-translate-y-px",
        ghost: "bg-transparent text-foreground border-2 border-transparent hover:bg-muted hover:border-border/50 dark:hover:bg-primary/25 dark:hover:border-primary/40",
        link: "text-primary underline-offset-4 hover:underline bg-transparent border-0 shadow-none",
        primary: "bg-primary text-primary-foreground border-2 border-primary shadow-sm hover:bg-primary/90 hover:border-primary/90 hover:shadow-md hover:-translate-y-px",
        "primary-outline": "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md",
        "secondary-outline": "bg-background text-foreground border-2 border-border hover:bg-muted hover:border-border/80 hover:shadow-md",
        action: "bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary/15 hover:border-primary/30 hover:-translate-y-px",
        success: "bg-green-600 text-white border-2 border-green-600 shadow-sm hover:bg-green-500 hover:border-green-500 hover:shadow-md hover:-translate-y-px",
        warning: "bg-yellow-600 text-white border-2 border-yellow-600 shadow-sm hover:bg-yellow-500 hover:border-yellow-500 hover:shadow-md hover:-translate-y-px"
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl text-sm",
        sm: "h-8 px-3 py-1 rounded-lg text-xs",
        lg: "h-12 px-8 py-3 rounded-xl text-base",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
