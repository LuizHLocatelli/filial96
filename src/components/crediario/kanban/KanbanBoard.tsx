
import React, { useState } from "react";
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
    addColumn,
    addCard,
  } = useKanbanBoard();

  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

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
