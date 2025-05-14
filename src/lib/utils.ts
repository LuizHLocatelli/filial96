
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cardColors = [
  { value: '#FFFFFF', label: 'Branco' },
  { value: '#F0F0F0', label: 'Cinza claro' },
  { value: '#FEFFD6', label: 'Amarelo claro' },
  { value: '#E6E6FA', label: 'Lavanda' },
  { value: '#FFE4E1', label: 'Rosa claro' },
  { value: '#E0FFE0', label: 'Verde claro' },
  { value: '#FFD1DC', label: 'Rosa' },
  { value: '#FFEBCD', label: 'Pêssego' },
  { value: '#FFF8DC', label: 'Creme' },
  { value: '#E0FFFF', label: 'Azul claro' },
];

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determines the appropriate text color (black or white) based on background color
 * to ensure good contrast and readability
 */
export function getTextColor(backgroundColor: string | undefined): string {
  if (!backgroundColor) return "#000000"; // Default to black text for undefined backgrounds
  
  // Remove the '#' and handle both 3-character and 6-character formats
  const hex = backgroundColor.replace('#', '');
  
  let r, g, b;
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    return "#000000"; // Default to black for invalid hex
  }
  
  // Calculate relative luminance using the formula for contrast
  // This is a simplified version of the WCAG luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
