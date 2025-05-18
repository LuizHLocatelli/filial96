
import { useTheme } from "@/contexts/ThemeContext";

interface PriorityBadgeProps {
  priority: 'baixa' | 'media' | 'alta';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { isDarkMode } = useTheme();
  
  const getStyles = () => {
    switch (priority) {
      case 'baixa':
        return {
          bg: isDarkMode ? 'bg-green-900/40' : 'bg-green-100',
          text: isDarkMode ? 'text-green-300' : 'text-green-700',
          border: isDarkMode ? 'border-green-700' : 'border-green-200'
        };
      case 'media':
        return {
          bg: isDarkMode ? 'bg-orange-900/40' : 'bg-orange-100',
          text: isDarkMode ? 'text-orange-300' : 'text-orange-700',
          border: isDarkMode ? 'border-orange-700' : 'border-orange-200'
        };
      case 'alta':
        return {
          bg: isDarkMode ? 'bg-red-900/40' : 'bg-red-100',
          text: isDarkMode ? 'text-red-300' : 'text-red-700',
          border: isDarkMode ? 'border-red-700' : 'border-red-200'
        };
      default:
        return {
          bg: isDarkMode ? 'bg-gray-900/40' : 'bg-gray-100',
          text: isDarkMode ? 'text-gray-300' : 'text-gray-700',
          border: isDarkMode ? 'border-gray-700' : 'border-gray-200'
        };
    }
  };

  const styles = getStyles();
  
  const labels = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta'
  };

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-md border ${styles.bg} ${styles.text} ${styles.border} font-medium`}>
      {labels[priority]}
    </span>
  );
}
