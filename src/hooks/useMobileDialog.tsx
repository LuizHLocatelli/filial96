
import { useIsMobile } from "@/hooks/use-mobile";

export function useMobileDialog() {
  const isMobile = useIsMobile();
  
  const getMobileDialogProps = (maxWidth?: string) => ({
    className: isMobile 
      ? "w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] mx-2 rounded-2xl" 
      : maxWidth ? `sm:max-w-${maxWidth}` : "sm:max-w-[600px]"
  });
  
  const getMobileContentProps = () => ({
    className: isMobile ? "p-4 max-h-[90vh] overflow-y-auto" : "p-6"
  });
  
  const getMobileButtonProps = () => ({
    className: isMobile ? "w-full min-h-[44px]" : ""
  });
  
  const getMobileFormProps = () => ({
    className: isMobile ? "space-y-3" : "space-y-4"
  });
  
  return {
    isMobile,
    getMobileDialogProps,
    getMobileContentProps,
    getMobileButtonProps,
    getMobileFormProps
  };
}
