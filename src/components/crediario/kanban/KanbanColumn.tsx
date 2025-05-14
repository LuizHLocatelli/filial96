
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { Column, TaskCard } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  column: Column;
  cards: TaskCard[];
  onAddCard: () => void;
  onDeleteCard?: (card: TaskCard) => void;
  onUpdateCard?: (cardId: string, updates: Partial<TaskCard>) => void;
}

export function KanbanColumn({ 
  column, 
  cards, 
  onAddCard,
  onDeleteCard,
  onUpdateCard 
}: KanbanColumnProps) {
  return (
    <Card className="w-full bg-background rounded-lg shadow-sm border border-border">
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{column.name}</h3>
          <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {cards.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="max-h-[250px]">
          <div className="space-y-2 pr-2">
            {cards.map((card) => (
              <KanbanCard 
                key={card.id} 
                card={card} 
                onDelete={onDeleteCard ? () => onDeleteCard(card) : undefined}
                onUpdate={onUpdateCard}
              />
            ))}
          </div>
        </ScrollArea>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-2 text-muted-foreground justify-start"
          onClick={onAddCard}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar cartão
        </Button>
      </CardContent>
    </Card>
  );
}
