
import React, { useState } from "react";
import { KanbanColumn } from "../KanbanColumn";
import { Column, TaskCard } from "../types";

interface ColumnListProps {
  columns: Column[];
  cards: TaskCard[];
  onAddCard?: (columnId: string) => void;
  onDeleteCard?: (cardId: string) => void;
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

  // Ordenar colunas por posição para garantir que sejam exibidas corretamente
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  // Função wrapper para adaptar os parâmetros
  const handleDeleteCard = (card: TaskCard) => {
    if (onDeleteCard) {
      onDeleteCard(card.id);
    }
  };

  // Função wrapper para adaptar os parâmetros
  const handleUpdateCard = (card: TaskCard, updates: Partial<TaskCard>) => {
    if (onUpdateCard) {
      onUpdateCard(card.id, updates);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 pb-4 overflow-x-auto min-h-[calc(100vh-250px)]">
      {sortedColumns.map((column) => (
        <div 
          key={column.id} 
          className="flex-shrink-0 w-full md:w-72 mb-6 md:mb-0 min-h-[300px]"
        >
          <KanbanColumn
            column={column}
            cards={cards.filter(card => card.column_id === column.id)}
            onAddCard={onAddCard}
            onDeleteCard={handleDeleteCard}
            onUpdateCard={handleUpdateCard}
            onMoveCard={onMoveCard}
            otherColumns={columns.filter(c => c.id !== column.id)}
          />
        </div>
      ))}
    </div>
  );
}
