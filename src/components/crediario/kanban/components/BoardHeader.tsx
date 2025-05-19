
import { Board } from "../types";
import { useTheme } from "@/contexts/ThemeContext";

export interface BoardHeaderProps {
  board: Board;
  onAddColumn?: () => void;
}

export function BoardHeader({ board, onAddColumn }: BoardHeaderProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex flex-col gap-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      <h2 className="text-2xl font-bold">{board.name}</h2>
      {board.description && (
        <p className="text-muted-foreground">{board.description}</p>
      )}
    </div>
  );
}
