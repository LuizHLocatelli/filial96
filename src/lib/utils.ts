
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cardColors = [
  { value: '#FFFFFF', label: 'Branco', textColor: '#000000' },
  { value: '#F0F4F8', label: 'Azul Claro', textColor: '#1A365D' },
  { value: '#FEFCBF', label: 'Amarelo', textColor: '#744210' },
  { value: '#E9D8FD', label: 'Lilás', textColor: '#553C9A' },
  { value: '#FED7D7', label: 'Rosa', textColor: '#9B2C2C' },
  { value: '#C6F6D5', label: 'Verde', textColor: '#22543D' },
  { value: '#FEE2E2', label: 'Vermelho Claro', textColor: '#7F1D1D' },
  { value: '#FED7AA', label: 'Laranja Claro', textColor: '#7B341E' },
  { value: '#FEEBC8', label: 'Pêssego', textColor: '#652B19' },
  { value: '#E2E8F0', label: 'Cinza', textColor: '#1A202C' },
]

export function getTextColor(backgroundColor: string | undefined) {
  if (!backgroundColor) return '#000000';
  
  const colorOption = cardColors.find(c => c.value === backgroundColor);
  return colorOption ? colorOption.textColor : '#000000';
}
