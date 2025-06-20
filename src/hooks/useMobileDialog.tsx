import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Constantes para tamanhos padronizados de diálogos
export const DIALOG_SIZES = {
  small: "sm:max-w-md max-h-[85vh] overflow-y-auto",
  medium: "sm:max-w-2xl max-h-[85vh] overflow-y-auto", 
  default: "max-w-4xl max-h-[85vh] overflow-y-auto",
  large: "max-w-5xl max-h-[85vh] overflow-y-auto",
  extraLarge: "max-w-6xl max-h-[85vh] overflow-y-auto",
  fullscreen: "max-w-none max-h-none w-screen h-screen"
} as const;

export type DialogSizeKey = keyof typeof DIALOG_SIZES;

export function useMobileDialog() {
  const isMobile = useIsMobile();
  
  const getMobileDialogProps = (size: DialogSizeKey = "default", maxHeight?: string) => {
    const baseClasses = isMobile 
      ? `w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] ${maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[85vh]'} rounded-2xl overflow-y-auto`
      : DIALOG_SIZES[size];
    
    return {
      className: baseClasses
    };
  };
  
  const getMobileAlertDialogProps = (size: DialogSizeKey = "small") => {
    // Para AlertDialogs, usamos apenas largura pois são menores
    const alertSizes = {
      small: "sm:max-w-md",
      medium: "sm:max-w-2xl", 
      default: "max-w-4xl",
      large: "max-w-5xl",
      extraLarge: "max-w-6xl",
      fullscreen: "max-w-none"
    };
    
    return {
      className: isMobile 
        ? "w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] rounded-2xl mx-2"
        : alertSizes[size]
    };
  };
  
  const getMobileButtonProps = () => ({
    className: isMobile ? "w-full min-h-[44px]" : ""
  });
  
  const getMobileFormProps = () => ({
    className: isMobile ? "space-y-3" : "space-y-4"
  });

  const getMobileFooterProps = () => ({
    className: isMobile 
      ? "flex flex-col gap-2 pt-6 border-t" 
      : "flex justify-end gap-3 pt-6 border-t"
  });
  
  return {
    isMobile,
    getMobileDialogProps,
    getMobileAlertDialogProps,
    getMobileButtonProps,
    getMobileFormProps,
    getMobileFooterProps,
    DIALOG_SIZES,
  };
}
