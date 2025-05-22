
import { useState } from "react";
import { useKanbanBoard } from "./hooks/useKanbanBoard";
import { toast } from "sonner";
import { KanbanBoard } from "./KanbanBoard";
import { AddCardDialog } from "./AddCardDialog";
import { PageHeader } from "./components/PageHeader";
import { BoardLoading } from "./components/BoardLoading";
import { BoardEmpty } from "./components/BoardEmpty";

export function Kanban() {
  const {
    board,
    columns,
    cards,
    isLoading,
    addCard,
    deleteCard,
    updateCard,
    moveCard
  } = useKanbanBoard();
  
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  
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
    backgroundColor?: string;
    labels?: string[];
  }) => {
    if (!targetColumnId) {
      toast.error("Nenhuma coluna selecionada para adicionar o cartão");
      return;
    }
    
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
      
      toast.success("Tarefa adicionada com sucesso");
      setAddCardDialogOpen(false);
      setTargetColumnId(null);
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast.error("Erro ao adicionar tarefa");
    }
  };

  if (isLoading) {
    return <BoardLoading />;
  }

  if (!board) {
    return <BoardEmpty />;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quadro de Tarefas" 
        description="Gerencie e acompanhe todas as atividades do setor de crediário"
        board={board}
        onAddTask={() => {
          const todoColumn = columns.find(col => col.name === "A Fazer");
          if (todoColumn) {
            handleOpenAddCardDialog(todoColumn.id);
          }
        }}
      />
      
      <KanbanBoard 
        columns={columns}
        cards={cards}
        onAddCard={handleOpenAddCardDialog}
        onDeleteCard={deleteCard}
        onUpdateCard={updateCard}
        onMoveCard={moveCard}
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
