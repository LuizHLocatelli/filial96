
import React, { useState } from "react";
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useKanbanBoard } from "./useKanbanBoard";
import { toast } from "sonner";
import { AddCardDialog } from "./AddCardDialog";
import { AddColumnDialog } from "./AddColumnDialog";
import { BoardHeader } from "./components/BoardHeader";
import { ColumnList } from "./components/ColumnList";
import { BoardLoading } from "./components/BoardLoading";
import { BoardEmpty } from "./components/BoardEmpty";

export function KanbanBoard() {
  const {
    board,
    columns,
    cards,
    isLoading,
    activeCard,
    setActiveCard,
    addColumn,
    updateColumnPosition,
    moveCardToColumn,
    updateCardPosition,
    addCard,
  } = useKanbanBoard();

  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'card') {
      setActiveCard(event.active.data.current.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle dragging cards between columns
    if (!activeCard) return;

    const { active, over } = event;
    
    if (!over) return;
    
    const activeCardId = active.id as string;
    const overContainerId = over.data.current?.type === 'column' 
      ? over.id as string 
      : over.data.current?.columnId as string;
    
    const activeColumnId = cards.find(card => card.id === activeCardId)?.column_id;
    
    if (activeColumnId !== overContainerId) {
      moveCardToColumn(activeCardId, overContainerId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveCard(null);
      return;
    }

    // Handle column reordering
    if (active.data.current?.type === 'column' && over.data.current?.type === 'column') {
      const activeColumnIndex = columns.findIndex(col => col.id === active.id);
      const overColumnIndex = columns.findIndex(col => col.id === over.id);
      
      if (activeColumnIndex !== -1 && overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
        const newOrder = arrayMove(columns, activeColumnIndex, overColumnIndex);
        
        // Update positions in database
        newOrder.forEach((column, index) => {
          updateColumnPosition(column.id, index);
        });
      }
    }
    
    // Handle card reordering within the same column
    if (active.data.current?.type === 'card' && over.data.current?.type === 'card') {
      const activeCardId = active.id as string;
      const overCardId = over.id as string;
      
      const activeColumnId = cards.find(card => card.id === activeCardId)?.column_id;
      const overColumnId = cards.find(card => card.id === overCardId)?.column_id;
      
      if (activeColumnId === overColumnId) {
        const columnCards = cards.filter(card => card.column_id === activeColumnId);
        
        const activeCardIndex = columnCards.findIndex(card => card.id === activeCardId);
        const overCardIndex = columnCards.findIndex(card => card.id === overCardId);
        
        if (activeCardIndex !== -1 && overCardIndex !== -1) {
          const newOrder = arrayMove(columnCards, activeCardIndex, overCardIndex);
          
          // Update positions
          newOrder.forEach((card, index) => {
            updateCardPosition(card.id, index);
          });
        }
      }
    }
    
    setActiveCard(null);
  };

  const handleAddColumn = (name: string) => {
    addColumn(name);
    setAddColumnDialogOpen(false);
    toast.success("Coluna adicionada com sucesso");
  };

  const handleOpenAddCardDialog = (columnId: string) => {
    setTargetColumnId(columnId);
    setAddCardDialogOpen(true);
  };

  const handleAddCard = (data: { title: string; description?: string; priority: string; assigneeId?: string; dueDate?: Date }) => {
    if (!targetColumnId) return;
    
    addCard({
      title: data.title,
      description: data.description,
      priority: data.priority,
      column_id: targetColumnId,
      assignee_id: data.assigneeId,
      due_date: data.dueDate ? data.dueDate.toISOString() : undefined,
    });
    
    setAddCardDialogOpen(false);
    setTargetColumnId(null);
    toast.success("Cartão adicionado com sucesso");
  };

  if (isLoading) {
    return <BoardLoading />;
  }

  if (!board) {
    return <BoardEmpty />;
  }

  return (
    <div className="space-y-4">
      <BoardHeader 
        board={board}
        onAddColumn={() => setAddColumnDialogOpen(true)}
      />

      <ColumnList
        columns={columns}
        cards={cards}
        activeCard={activeCard}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onAddCard={handleOpenAddCardDialog}
      />

      <AddColumnDialog
        open={addColumnDialogOpen}
        onOpenChange={setAddColumnDialogOpen}
        onAddColumn={handleAddColumn}
      />

      <AddCardDialog
        open={addCardDialogOpen}
        onOpenChange={setAddCardDialogOpen}
        onAddCard={handleAddCard}
      />
    </div>
  );
}
