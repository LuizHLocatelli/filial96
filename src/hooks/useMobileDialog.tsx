import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Constantes para tamanhos padronizados de diálogos com 3 breakpoints (mobile, medium, large)
// Padrão: <768px (mobile) | 768-1024px (medium) | ≥1024px (large)
// Estrutura corrigida para scroll vertical: flex flex-col com overflow-hidden no container e overflow-y-auto no conteúdo
export const DIALOG_SIZES = {
  small: "sm:max-w-md max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col",
  medium: "sm:max-w-2xl max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col",
  default: "max-w-4xl max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col",
  large: "max-w-5xl max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col",
  extraLarge: "max-w-6xl max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col",
  fullscreen: "max-w-none max-h-none w-screen h-screen overflow-hidden flex flex-col"
} as const;

// Classe para área de conteúdo scrollável dentro do diálogo
// Deve ser usada no elemento que contém o conteúdo principal (entre header e footer)
export const DIALOG_SCROLLABLE_CONTENT = "flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent";

export type DialogSizeKey = keyof typeof DIALOG_SIZES;

export function useMobileDialog() {
  const isMobile = useIsMobile();

  const getMobileDialogProps = (size: DialogSizeKey = "default", maxHeight?: string) => {
    const baseClasses = isMobile
      ? `w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] ${maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh]'} rounded-2xl overflow-hidden flex flex-col p-0`
      : DIALOG_SIZES[size];

    return {
      className: baseClasses
    };
  };

  const getMobileAlertDialogProps = (size: DialogSizeKey = "small") => {
    // Para AlertDialogs, usamos 3 breakpoints para padding e tamanhos
    const alertSizes = {
      small: "sm:max-w-md p-3 md:p-5 lg:p-6",
      medium: "sm:max-w-2xl p-3 md:p-5 lg:p-6",
      default: "max-w-4xl p-3 md:p-5 lg:p-6",
      large: "max-w-5xl p-3 md:p-5 lg:p-6",
      extraLarge: "max-w-6xl p-3 md:p-5 lg:p-6",
      fullscreen: "max-w-none p-3 md:p-5 lg:p-6"
    };

    return {
      className: isMobile
        ? "w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] rounded-2xl mx-2 p-3"
        : alertSizes[size]
    };
  };

  const getMobileButtonProps = () => ({
    className: isMobile ? "w-full h-9 md:h-10 text-xs md:text-sm" : "h-9 md:h-10 text-xs md:text-sm"
  });

  const getMobileFormProps = () => ({
    className: "space-y-3 md:space-y-4"
  });

  const getMobileFooterProps = () => ({
    className: "flex-shrink-0 border-t bg-background p-3 md:p-5 lg:p-6 pt-3 flex flex-col md:flex-row gap-2 md:gap-3"
  });

  return {
    isMobile,
    getMobileDialogProps,
    getMobileAlertDialogProps,
    getMobileButtonProps,
    getMobileFormProps,
    getMobileFooterProps,
    DIALOG_SIZES,
    DIALOG_SCROLLABLE_CONTENT,
  };
}
