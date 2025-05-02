
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, className, ...props }) {
        const isWelcomeToast = className?.includes("welcome-toast");
        
        return (
          <Toast 
            key={id} 
            {...props}
            className={cn(
              className,
              isWelcomeToast && "welcome-toast-container bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none py-6 px-8 rounded-lg shadow-lg animate-scale-in"
            )}
          >
            <div className={cn("grid gap-1", isWelcomeToast && "text-center")}>
              {title && (
                <ToastTitle className={cn(isWelcomeToast && "text-2xl font-bold mb-1")}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className={cn(isWelcomeToast && "text-base opacity-90")}>
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className={isWelcomeToast ? "text-white hover:text-white/80" : ""} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
