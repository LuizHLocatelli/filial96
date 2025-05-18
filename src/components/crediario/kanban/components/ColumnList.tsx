
import { Column, TaskCard } from "../types";
import { KanbanColumn } from "../KanbanColumn";
import { useTheme } from "@/contexts/ThemeContext";

interface ColumnListProps {
  columns: Column[];
  cards: TaskCard[];
  onAddCard: (columnId: string) => void;
  onDeleteCard: (card: TaskCard) => void;
  onUpdateCard: (cardId: string, updates: Partial<TaskCard>) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function ColumnList({
  columns,
  cards,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onEditColumn,
  onDeleteColumn
}: ColumnListProps) {
  const { isDarkMode } = useTheme();
  
  // Ordenar colunas pela posição
  const sortedColumns = [...columns].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    return 0;
  });

  return (
    <div 
      className={`flex gap-4 min-h-[calc(100vh-250px)] p-2 rounded-lg ${
        isDarkMode 
          ? 'bg-gray-900/30 backdrop-blur-sm shadow-inner' 
          : 'bg-gray-100/60 border border-gray-200'
      }`}
    >
      {sortedColumns.map(column => (
        <KanbanColumn
          key={column.id}
          column={column}
          cards={cards}
          onAddCard={onAddCard}
          onDeleteCard={onDeleteCard}
          onUpdateCard={onUpdateCard}
          onEditColumn={onEditColumn}
          onDeleteColumn={onDeleteColumn}
        />
      ))}
    </div>
  );
}
