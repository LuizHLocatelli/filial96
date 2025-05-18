
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
  
  return (
    <div>
      <div className="flex justify-between items-start gap-2">
        <h3 
          className={`font-medium truncate mb-1 text-base ${isDarkMode && !textColor ? 'text-gray-100' : ''}`}
          style={textColor ? { color: textColor } : undefined}
        >
          {title}
        </h3>
        <PriorityBadge priority={priority} />
      </div>
      
      {description && (
        <p 
          className={`text-sm line-clamp-2 ${isDarkMode && !textColor ? 'text-gray-300/90' : 'dark:text-opacity-90'}`}
          style={textColor ? { color: textColor, opacity: 0.9 } : undefined}
        >
          {description}
        </p>
      )}
    </div>
  );
}
