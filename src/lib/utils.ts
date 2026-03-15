
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date using date-fns
 */
export function formatDate(date: string | Date, formatString: string = "dd/MM/yyyy"): string {
  return format(new Date(date), formatString, { locale: ptBR });
}
