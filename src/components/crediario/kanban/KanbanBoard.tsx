
import React, { useState } from "react";
import { useKanbanBoard } from "./useKanbanBoard";
import { toast } from "sonner";
import { AddCardDialog } from "./AddCardDialog";
import { AddColumnDialog } from "./AddColumnDialog";
import { EditColumnDialog } from "./EditColumnDialog";
import { BoardHeader } from "./components/BoardHeader";
import { ColumnList } from "./components/ColumnList";
import { BoardLoading } from "./components/BoardLoading";
import { BoardEmpty } from "./components/BoardEmpty";
import { Column, TaskCard } from "./types";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function KanbanBoard() {
  const {
    board,
    columns,
    cards,
    isLoading,
    addColumn,
    editColumn,
    deleteColumn,
    addCard,
    deleteCard,
    updateCard
  } = useKanbanBoard();
  const { isDarkMode } = useTheme();

  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

  const handleAddColumn = (name: string) => {
    addColumn(name);
    setAddColumnDialogOpen(false);
    toast.success("Coluna adicionada com sucesso");
  };
  
  const handleEditColumn = (column: Column) => {
    setSelectedColumn(column);
    setEditColumnDialogOpen(true);
  };
  
  const handleEditColumnSubmit = async (columnId: string, name: string) => {
    const success = await editColumn(columnId, name);
    if (success) {
      setEditColumnDialogOpen(false);
    }
  };
  
  const handleDeleteColumn = async (columnId: string) => {
    const success = await deleteColumn(columnId);
    if (success) {
      toast.success("Coluna excluída com sucesso");
    }
  };

  const handleOpenAddCardDialog = (columnId: string) => {
    setTargetColumnId(columnId);
    setAddCardDialogOpen(true);
  };

  const handleAddCard = async (data: { 
    title: string; 
    description?: string; 
    priority: string; 
    assigneeId?: string; 
    dueDate?: Date; 
    dueTime?: string;
    backgroundColor?: string 
  }) => {
    if (!targetColumnId) {
      console.error("Nenhuma coluna selecionada para adicionar o cartão");
      return;
    }
    
    console.log("Adicionando cartão à coluna:", targetColumnId);
    console.log("Dados do cartão:", data);
    
    try {
      await addCard({
        title: data.title,
        description: data.description,
        priority: data.priority,
        column_id: targetColumnId,
        assignee_id: data.assigneeId,
        due_date: data.dueDate ? data.dueDate.toISOString() : undefined,
        due_time: data.dueTime,
        background_color: data.backgroundColor
      });
      
      toast.success("Cartão adicionado com sucesso");
      setAddCardDialogOpen(false);
      setTargetColumnId(null);
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error);
      toast.error("Erro ao adicionar cartão");
    }
  };

  const handleDeleteCard = (card: TaskCard) => {
    deleteCard(card.id);
  };

  const handleUpdateCard = (cardId: string, updates: Partial<TaskCard>) => {
    updateCard(cardId, updates);
  };

  if (isLoading) {
    return <BoardLoading />;
  }

  if (!board) {
    return <BoardEmpty />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <BoardHeader 
          board={board}
          onAddColumn={() => setAddColumnDialogOpen(true)}
        />
        
        <Button 
          onClick={() => setAddColumnDialogOpen(true)} 
          size="sm" 
          className="bg-brand-blue-600 hover:bg-brand-blue-700 text-white dark:bg-brand-blue-500 dark:hover:bg-brand-blue-600 dark:text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4 mr-1" /> Nova Coluna
        </Button>
      </div>

      <div className="w-full overflow-x-auto pb-2">
        <ColumnList
          columns={columns}
          cards={cards}
          onAddCard={handleOpenAddCardDialog}
          onDeleteCard={handleDeleteCard}
          onUpdateCard={handleUpdateCard}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
        />
      </div>

      <AddColumnDialog
        open={addColumnDialogOpen}
        onOpenChange={setAddColumnDialogOpen}
        onAddColumn={handleAddColumn}
      />
      
      <EditColumnDialog
        open={editColumnDialogOpen}
        onOpenChange={setEditColumnDialogOpen}
        column={selectedColumn}
        onEditColumn={handleEditColumnSubmit}
      />

      <AddCardDialog
        columnId={targetColumnId || ""}
        open={addCardDialogOpen}
        onOpenChange={setAddCardDialogOpen}
        onAddCard={handleAddCard}
      />
    </div>
  );
}
