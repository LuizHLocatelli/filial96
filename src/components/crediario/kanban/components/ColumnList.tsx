
import { Column, TaskCard } from "../types";
import { KanbanColumn } from "../KanbanColumn";

interface ColumnListProps {
  columns: Column[];
  cards: TaskCard[];
  onAddCard: (columnId: string) => void;
  onDeleteCard?: (card: TaskCard) => void;
  onUpdateCard?: (cardId: string, updates: Partial<TaskCard>) => void;
}

export function ColumnList({ columns, cards, onAddCard, onDeleteCard, onUpdateCard }: ColumnListProps) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 px-2">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          cards={cards.filter((card) => card.column_id === column.id)}
          onAddCard={() => onAddCard(column.id)}
          onDeleteCard={onDeleteCard}
          onUpdateCard={onUpdateCard}
        />
      ))}
    </div>
  );
}
