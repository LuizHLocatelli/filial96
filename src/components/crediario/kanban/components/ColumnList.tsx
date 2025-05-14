
import { Column, TaskCard } from "../types";
import { KanbanColumn } from "../KanbanColumn";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnListProps {
  columns: Column[];
  cards: TaskCard[];
  onAddCard: (columnId: string) => void;
  onDeleteCard?: (card: TaskCard) => void;
  onUpdateCard?: (cardId: string, updates: Partial<TaskCard>) => void;
  onEditColumn?: (column: Column) => void;
  onDeleteColumn?: (columnId: string) => void;
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
  return (
    <ScrollArea className="h-[70vh]">
      <div className="flex flex-col space-y-4 px-2 pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cards.filter((card) => card.column_id === column.id)}
            onAddCard={() => onAddCard(column.id)}
            onDeleteCard={onDeleteCard}
            onUpdateCard={onUpdateCard}
            onEditColumn={onEditColumn}
            onDeleteColumn={onDeleteColumn}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
