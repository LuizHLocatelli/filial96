
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Column, TaskCard } from "./types";
import { KanbanColumn } from "./KanbanColumn";
import { useState } from "react";
import { TaskCardPreview } from "./components/TaskCardPreview";
import { useTheme } from "@/contexts/ThemeContext";
import { ColumnList } from "./components/ColumnList";

interface KanbanBoardProps {
  columns: Column[];
  cards: TaskCard[];
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<TaskCard>) => void;
  onMoveCard: (cardId: string, targetColumnId: string) => void;
}

export function KanbanBoard({
  columns,
  cards,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onMoveCard
}: KanbanBoardProps) {
  const { isDarkMode } = useTheme();
  const [activeCard, setActiveCard] = useState<TaskCard | null>(null);
  
  // Configurar sensores para o DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Distância mínima para iniciar o drag
      },
    })
  );
  
  // Ordenar colunas por posição
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardId = active.id as string;
    const draggedCard = cards.find(card => card.id === cardId);
    
    if (draggedCard) {
      setActiveCard(draggedCard);
    }
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    // Este método pode ser usado para fornecer feedback visual enquanto arrasta
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const cardId = active.id as string;
      const columnId = over.id as string;
      
      // Verificar se o over.id é uma coluna válida
      const targetColumn = columns.find(col => col.id === columnId);
      
      if (targetColumn) {
        onMoveCard(cardId, columnId);
      }
    }
    
    setActiveCard(null);
  };
  
  if (sortedColumns.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 border-2 border-dashed rounded-md">
        <p className="text-muted-foreground">Nenhuma coluna configurada. Entre em contato com o administrador.</p>
      </div>
    );
  }
  
  // Create adapter functions to convert between card and cardId
  const handleDeleteCardAdapter = (card: TaskCard) => {
    onDeleteCard(card.id);
  };

  const handleUpdateCardAdapter = (card: TaskCard, updates: Partial<TaskCard>) => {
    onUpdateCard(card.id, updates);
  };
  
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col md:flex-row gap-4 pb-8 overflow-x-auto min-h-[calc(100vh-250px)]">
        <ColumnList 
          columns={sortedColumns}
          cards={cards}
          onAddCard={onAddCard}
          onDeleteCard={onDeleteCard}
          onUpdateCard={onUpdateCard}
          onMoveCard={onMoveCard}
        />
      </div>
      
      {activeCard && <TaskCardPreview card={activeCard} />}
    </DndContext>
  );
}
