
import { useState } from "react";
import { Column, TaskCard } from "./types";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface KanbanColumnProps {
  column: Column;
  cards: TaskCard[];
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<TaskCard>) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onUpdateCard
}: KanbanColumnProps) {
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Configurar o droppable para a coluna
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });
  
  // Ordenar os cartões por posição
  const sortedCards = [...cards].sort((a, b) => a.position - b.position);
  
  // Determinar estilos baseados na coluna
  const getHeaderStyle = () => {
    switch(column.name) {
      case 'A Fazer':
        return 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30';
      case 'Fazendo':
        return 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30';
      case 'Feita':
        return 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/30';
      default:
        return 'border-gray-300 dark:border-gray-700';
    }
  };
  
  // Determinar estilos do badge
  const getBadgeStyle = () => {
    switch(column.name) {
      case 'A Fazer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300';
      case 'Fazendo':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300';
      case 'Feita':
        return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300';
      default:
        return '';
    }
  };
  
  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-full md:w-80 mb-6 md:mb-0 flex flex-col h-[65vh] border dark:border-gray-700 rounded-md shadow-sm",
        isOver ? "ring-2 ring-primary/50" : "",
        isDarkMode ? "bg-gray-800/50" : "bg-white"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex justify-between items-center p-3 border-b dark:border-gray-700 border-l-4 ${getHeaderStyle()}`}>
        <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
          {column.name}
          <Badge variant="outline" className={`${getBadgeStyle()} ml-1`}>
            {sortedCards.length}
          </Badge>
        </h3>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-3 pr-1">
          {sortedCards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={() => onDeleteCard(card.id)}
              onUpdate={(updates) => onUpdateCard(card.id, updates)}
            />
          ))}
          
          {sortedCards.length === 0 && (
            <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-md border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
              <p className="text-sm text-muted-foreground">Nenhuma tarefa nesta coluna</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Button
        onClick={() => onAddCard(column.id)}
        className={cn(
          "m-2 gap-1 justify-center rounded transition-all",
          isHovered ? "shadow-md" : ""
        )}
        size="sm"
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        <span>Adicionar Tarefa</span>
      </Button>
    </div>
  );
}
