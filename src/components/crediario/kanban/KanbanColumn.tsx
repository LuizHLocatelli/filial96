
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { Column, TaskCard } from "./types";

interface KanbanColumnProps {
  column: Column;
  cards: TaskCard[];
  onAddCard: () => void;
}

export function KanbanColumn({ column, cards, onAddCard }: KanbanColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80 bg-background rounded-lg shadow-sm border border-border"
      {...attributes}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="p-3 border-b cursor-grab" {...listeners}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{column.name}</h3>
            <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {cards.length}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-1 overflow-y-auto max-h-[65vh]">
          <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {cards.map((card) => (
                <KanbanCard key={card.id} card={card} />
              ))}
            </div>
          </SortableContext>
          
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
    </div>
  );
}
