
import { TaskCard, Column } from "./types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  column: Column;
  cards: TaskCard[];
  otherColumns?: Column[];
  onAddCard?: (columnId: string) => void;
  onDeleteCard?: (card: TaskCard) => void;
  onUpdateCard?: (card: TaskCard, updates: Partial<TaskCard>) => void;
  onMoveCard?: (cardId: string, targetColumnId: string) => void;
}

export function KanbanColumn({
  column,
  cards = [],
  otherColumns = [],
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onMoveCard,
}: KanbanColumnProps) {
  // Sort cards by position
  const sortedCards = [...cards].sort((a, b) => a.position - b.position);
  
  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard(column.id);
    }
  };
  
  return (
    <div 
      className="bg-muted/30 dark:bg-muted/20 rounded-md shadow-sm flex flex-col h-full"
      id={column.id}
    >
      <div className="p-3 border-b flex items-center justify-between bg-muted/50 dark:bg-muted/30 rounded-t-md">
        <div>
          <h3 className="font-medium text-sm">
            {column.name}
            <span className="ml-2 text-xs text-muted-foreground">
              ({cards.length})
            </span>
          </h3>
        </div>
        
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleAddCard}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Adicionar Cartão</span>
        </Button>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-300px)] space-y-2">
        {sortedCards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onDelete={() => onDeleteCard && onDeleteCard(card)}
            onUpdate={(updates) => onUpdateCard && onUpdateCard(card, updates)}
          />
        ))}
        
        {sortedCards.length === 0 && (
          <div className="h-20 flex items-center justify-center border border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">
              Sem tarefas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
