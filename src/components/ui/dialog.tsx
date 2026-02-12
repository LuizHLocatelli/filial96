import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideCloseButton?: boolean }
>(({ className, children, hideCloseButton, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <DialogPortal container={typeof document !== 'undefined' ? document.body : undefined}>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl",
          "shadow-2xl glass-card-strong",
          isMobile
            ? "w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] rounded-3xl"
            : "rounded-2xl",
          "max-h-[85vh] flex flex-col overflow-hidden",
          className
        )}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0
        }}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close className={cn(
            "absolute z-50 ring-offset-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
            isMobile 
              ? "right-2 top-2 h-9 w-9 rounded-full bg-background/95 backdrop-blur-md border border-border/40 shadow-lg flex items-center justify-center hover:bg-background hover:shadow-xl hover:scale-105 active:scale-95" 
              : "right-3 top-3 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border border-border/30 shadow-md flex items-center justify-center hover:bg-background hover:shadow-lg hover:scale-105"
          )}>
            <X className={cn("text-foreground/80 hover:text-foreground transition-colors", isMobile ? "h-4 w-4" : "h-4 w-4")} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        "flex flex-col text-center sm:text-left",
        isMobile ? "space-y-1" : "space-y-1.5",
        className
      )}
      {...props}
    />
  );
}
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        isMobile 
          ? "flex flex-col gap-2" 
          : "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        isMobile ? "text-base" : "text-lg",
        className
      )}
      {...props}
    />
  );
})
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(
        "text-muted-foreground",
        isMobile ? "text-sm leading-normal" : "text-sm leading-relaxed",
        "whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal sm:overflow-visible",
        className
      )}
      {...props}
    />
  );
})
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
