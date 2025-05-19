
import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getTextColor } from "@/lib/utils";

interface CardContainerProps {
  children: ReactNode;
  backgroundColor?: string;
  onClick?: () => void;
}

export function CardContainer({ children, backgroundColor, onClick }: CardContainerProps) {
  const { isDarkMode } = useTheme();
  const textColor = backgroundColor ? getTextColor(backgroundColor) : undefined;

  // Calculate background color for dark mode
  const getCardBackground = () => {
    if (backgroundColor) {
      // Melhora a visibilidade do cartão no modo escuro
      const bgColor = backgroundColor.toLowerCase();
      if (isDarkMode) {
        if (bgColor === '#ffffff' || bgColor === 'white') {
          return '#2a2a2a'; // Substitui branco por cinza escuro no dark mode
        }
        // Adiciona alguma transparência para melhorar visualização
        return `${bgColor}dd`;
      }
      return bgColor;
    }
    return isDarkMode ? '#2a2a2a' : 'white';
  };

  const getBorderStyle = () => {
    return isDarkMode 
      ? "border-gray-700 hover:border-gray-500"
      : "border-gray-200 hover:border-gray-300";
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-md border shadow-sm cursor-pointer hover:shadow-md transition-all ${getBorderStyle()}`}
      style={{ 
        backgroundColor: getCardBackground(),
        color: isDarkMode ? "#e1e1e1" : textColor
      }}
    >
      {children}
    </div>
  );
}
