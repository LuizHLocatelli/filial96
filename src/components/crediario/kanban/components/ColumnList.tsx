
import React, { useState } from "react";
import { KanbanColumn } from "../KanbanColumn";
import { Column, TaskCard } from "../types";

interface ColumnListProps {
  columns: Column[];
  cards: TaskCard[];
  onAddCard?: (columnId: string) => void;  // Updated to accept columnId parameter
  onDeleteCard?: (card: TaskCard) => void;
  onUpdateCard?: (cardId: string, updates: Partial<TaskCard>) => void;
  onMoveCard?: (cardId: string, targetColumnId: string) => void;
}

export function ColumnList({ 
  columns, 
  cards, 
  onAddCard, 
  onDeleteCard, 
  onUpdateCard,
  onMoveCard
}: ColumnListProps) {
  const [isDragging, setIsDragging] = useState(false);

  if (columns.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 border-2 border-dashed rounded-md">
        <p className="text-muted-foreground">Nenhuma coluna criada. Adicione uma coluna para começar.</p>
      </div>
    );
  }

  const getColumnCards = (columnId: string) => {
    return cards.filter(card => card.column_id === columnId);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto">
      {columns.map((column) => (
        <div 
          key={column.id} 
          className="flex-shrink-0 w-full md:w-72"
        >
          <KanbanColumn
            column={column}
            cards={getColumnCards(column.id)}
            onAddCard={onAddCard}
            onDeleteCard={onDeleteCard}
            onUpdateCard={onUpdateCard}
            onMoveCard={onMoveCard}
            otherColumns={columns.filter(c => c.id !== column.id)}
          />
        </div>
      ))}
    </div>
  );
}
