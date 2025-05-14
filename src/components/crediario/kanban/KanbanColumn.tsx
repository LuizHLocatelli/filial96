
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { Column, TaskCard } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface KanbanColumnProps {
  column: Column;
  cards: TaskCard[];
  onAddCard: () => void;
  onDeleteCard?: (card: TaskCard) => void;
  onUpdateCard?: (cardId: string, updates: Partial<TaskCard>) => void;
  onEditColumn?: (column: Column) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export function KanbanColumn({ 
  column, 
  cards, 
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onEditColumn,
  onDeleteColumn 
}: KanbanColumnProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  return (
    <Card className="w-full bg-background rounded-lg shadow-sm border border-border">
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{column.name}</h3>
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {cards.length}
            </div>
            
            {(onEditColumn || onDeleteColumn) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditColumn && (
                    <DropdownMenuItem onClick={() => onEditColumn(column)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                  )}
                  {onDeleteColumn && (
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Coluna</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a coluna "{column.name}"? 
              Esta ação não pode ser desfeita e só é possível se a coluna estiver vazia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (onDeleteColumn) {
                  onDeleteColumn(column.id);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
