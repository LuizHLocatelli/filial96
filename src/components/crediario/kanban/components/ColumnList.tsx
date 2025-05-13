
import React from "react";
import { KanbanColumn } from "../KanbanColumn";
import { Column, TaskCard } from "../types";

interface ColumnListProps {
  columns: Column[];
  cards: TaskCard[];
  onAddCard: (columnId: string) => void;
}

export function ColumnList({
  columns,
  cards,
  onAddCard
}: ColumnListProps) {
  return (
    <div className="rounded-lg bg-secondary/20 p-4 overflow-x-auto">
      <div className="flex gap-4 min-h-[500px]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cards.filter(card => card.column_id === column.id)}
            onAddCard={() => onAddCard(column.id)}
          />
        ))}
      </div>
    </div>
  );
}
