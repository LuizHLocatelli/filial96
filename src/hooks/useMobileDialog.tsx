import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function useMobileDialog() {
  const isMobile = useIsMobile();
  
  const getMobileDialogProps = (maxWidth?: string) => ({
    className: isMobile 
      ? "dialog-content-center w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] rounded-2xl" 
      : maxWidth ? `dialog-content-center sm:max-w-${maxWidth}` : "dialog-content-center sm:max-w-[600px]"
  });
  
  const getMobileContentProps = () => ({
    className: isMobile ? "p-4 max-h-[90vh] overflow-y-auto" : "p-6",
    style: {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      margin: 0
    } as React.CSSProperties
  });
  
  const getMobileButtonProps = () => ({
    className: isMobile ? "w-full min-h-[44px]" : ""
  });
  
  const getMobileFormProps = () => ({
    className: isMobile ? "space-y-3" : "space-y-4"
  });

  // Novo método para garantir centralização de qualquer diálogo
  const getCenteredDialogProps = (customClassName?: string) => ({
    className: `dialog-content-center ${customClassName || ''}`.trim(),
    style: {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      margin: 0
    } as React.CSSProperties
  });
  
  return {
    isMobile,
    getMobileDialogProps,
    getMobileContentProps,
    getMobileButtonProps,
    getMobileFormProps,
    getCenteredDialogProps
  };
}
