
import { PriorityBadge } from "./PriorityBadge";
import { useTheme } from "@/contexts/ThemeContext";

interface CardContentProps {
  title: string;
  description?: string | null;
  priority: 'baixa' | 'media' | 'alta';
  textColor?: string;
}

export function CardContent({ 
  title, 
  description,
  priority,
  textColor
}: CardContentProps) {
  const { isDarkMode } = useTheme();
  
  // For dark mode, ensure we use a legible text color
  const textColorValue = isDarkMode 
    ? (textColor ? `${textColor}ee` : "#e5e5e5") // slightly transparent color in dark mode for better contrast
    : textColor;
  
  return (
    <div>
      <div className="flex justify-between items-start gap-2">
        <h3 
          className="font-medium truncate mb-1 text-base"
          style={textColor ? { color: textColorValue } : undefined}
        >
          {title}
        </h3>
        <PriorityBadge priority={priority} />
      </div>
      
      {description && (
        <p 
          className="text-sm line-clamp-2"
          style={textColor ? { color: textColorValue, opacity: 0.9 } : undefined}
        >
          {description}
        </p>
      )}
    </div>
  );
}
