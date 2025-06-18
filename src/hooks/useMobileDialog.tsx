import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function useMobileDialog() {
  const isMobile = useIsMobile();
  
  const getMobileDialogProps = (maxWidth?: string, maxHeight?: string) => ({
    className: isMobile 
      ? `w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] ${maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[85vh]'} rounded-2xl` 
      : maxWidth ? `sm:max-w-${maxWidth}` : "sm:max-w-[600px]"
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
    getMobileButtonProps,
    getMobileFormProps,
  };
}
