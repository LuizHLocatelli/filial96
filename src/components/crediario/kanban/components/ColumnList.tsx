
import React from "react";
import { DndContext, closestCenter, DragEndEvent, DragOverEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from "../KanbanColumn";
import { Column, TaskCard } from "../types";

interface ColumnListProps {
  columns: Column[];
  cards: TaskCard[];
  activeCard: TaskCard | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onAddCard: (columnId: string) => void;
}

export function ColumnList({
  columns,
  cards,
  activeCard,
  onDragStart,
  onDragOver,
  onDragEnd,
  onAddCard
}: ColumnListProps) {
  // Add sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <div className="rounded-lg bg-secondary/20 p-4 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 min-h-[500px]">
          <SortableContext items={columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={cards.filter(card => card.column_id === column.id)}
                onAddCard={() => onAddCard(column.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
