
import React, { useState, useEffect } from "react";
import { useKanbanBoard } from "./useKanbanBoard";
import { toast } from "sonner";
import { AddCardDialog } from "./AddCardDialog";
import { BoardHeader } from "./components/BoardHeader";
import { ColumnList } from "./components/ColumnList";
import { BoardLoading } from "./components/BoardLoading";
import { BoardEmpty } from "./components/BoardEmpty";
import { Column, TaskCard } from "./types";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// IDs das colunas fixas
const FIXED_COLUMNS = {
  A_FAZER: 'a_fazer',
  FAZENDO: 'fazendo',
  FEITA: 'feita'
};

export function KanbanBoard() {
  const {
    board,
    columns: dbColumns,
    cards,
    isLoading,
    addCard,
    deleteCard,
    updateCard,
    moveCard
  } = useKanbanBoard();
  
  const { isDarkMode } = useTheme();
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  
  // Criar colunas fixas
  const [columns, setColumns] = useState<Column[]>([]);
  
  // Configure as colunas fixas baseadas no board atual
  useEffect(() => {
    if (board) {
      // Verifique se já temos as colunas fixas no banco de dados
      const aFazerCol = dbColumns.find(col => col.id === FIXED_COLUMNS.A_FAZER);
      const fazendoCol = dbColumns.find(col => col.id === FIXED_COLUMNS.FAZENDO);
      const feitaCol = dbColumns.find(col => col.id === FIXED_COLUMNS.FEITA);
      
      // Crie as colunas fixas, mantendo as existentes ou criando novas
      const fixedColumns: Column[] = [
        aFazerCol || {
          id: FIXED_COLUMNS.A_FAZER,
          board_id: board.id,
          name: 'A Fazer',
          position: 0,
          created_by: board.created_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        fazendoCol || {
          id: FIXED_COLUMNS.FAZENDO,
          board_id: board.id,
          name: 'Fazendo',
          position: 1,
          created_by: board.created_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        feitaCol || {
          id: FIXED_COLUMNS.FEITA,
          board_id: board.id,
          name: 'Feita',
          position: 2,
          created_by: board.created_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setColumns(fixedColumns);
    }
  }, [board, dbColumns]);

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
  
  const handleMoveCard = (cardId: string, targetColumnId: string) => {
    moveCard(cardId, targetColumnId);
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
        <BoardHeader board={board} />
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleOpenAddCardDialog(FIXED_COLUMNS.A_FAZER)} 
            size="sm" 
            className="bg-brand-blue-600 hover:bg-brand-blue-700 text-white dark:bg-brand-blue-500 dark:hover:bg-brand-blue-600 dark:text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="w-full">
        <ColumnList
          columns={columns}
          cards={cards}
          onAddCard={handleOpenAddCardDialog}
          onDeleteCard={handleDeleteCard}
          onUpdateCard={handleUpdateCard}
          onMoveCard={handleMoveCard}
        />
      </div>

      <AddCardDialog
        columnId={targetColumnId || ""}
        open={addCardDialogOpen}
        onOpenChange={setAddCardDialogOpen}
        onAddCard={handleAddCard}
      />
    </div>
  );
}
