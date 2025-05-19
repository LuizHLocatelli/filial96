
import { useState, useEffect } from "react";
import { TaskCard } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUsers } from "./useUsers";
import { formatDate } from "@/lib/utils";
import { CardComments } from "./CardComments";
import { Badge } from "@/components/ui/badge";
import { Trash, MoreHorizontal, Clock, ArrowRightCircle, MoveRight } from "lucide-react";
import { useKanbanBoard } from "./useKanbanBoard";

interface CardDetailsProps {
  card: TaskCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoveCard?: (cardId: string, targetColumnId: string) => void;
}

export function CardDetails({
  card,
  open,
  onOpenChange,
  onMoveCard,
}: CardDetailsProps) {
  const { isDarkMode } = useTheme();
  const { usersData } = useUsers();
  const { columns } = useKanbanBoard();
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);

  const assignee = card.assignee_id
    ? usersData.find((user) => user.id === card.assignee_id)
    : null;

  const currentColumn = columns.find(column => column.id === card.column_id);

  // Simplified version to just show the move options
  const handleMoveCardToColumn = (targetColumnId: string) => {
    if (onMoveCard) {
      onMoveCard(card.id, targetColumnId);
      onOpenChange(false); // Close the dialog after moving
    }
  };

  // Get available columns to move to (only return valid columns, not the current one)
  const availableColumns = columns.filter(column => column.id !== card.column_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[600px] max-h-[85vh] overflow-y-auto ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="mr-8 text-xl">{card.title}</DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
                }`}
              >
                {availableColumns.length > 0 && (
                  <>
                    <DropdownMenuItem disabled className="text-sm opacity-70 px-2">
                      Mover para
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    
                    {availableColumns.map(column => (
                      <DropdownMenuItem 
                        key={column.id} 
                        onClick={() => handleMoveCardToColumn(column.id)}
                        className="flex items-center gap-1"
                      >
                        <MoveRight className="h-4 w-4 mr-1" />
                        {column.name}
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem className="text-destructive">
                  <Trash className="h-4 w-4 mr-1" /> Excluir cartão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <div className="mt-2 flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={`${
              card.priority === "alta"
                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800"
                : card.priority === "media"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800"
            }`}
          >
            Prioridade: {card.priority}
          </Badge>
          
          {currentColumn && (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              {currentColumn.name}
            </Badge>
          )}

          {card.due_date && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800"
            >
              <Clock className="h-3 w-3" />
              {formatDate(new Date(card.due_date))}
              {card.due_time && ` - ${card.due_time}`}
            </Badge>
          )}
        </div>

        {card.description && (
          <div className="mt-4">
            <h4 className="font-medium mb-1">Descrição</h4>
            <div className="text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border">
              {card.description}
            </div>
          </div>
        )}

        {assignee && (
          <div className="mt-4">
            <h4 className="font-medium mb-1">Responsável</h4>
            <div className="flex items-center">
              <div
                className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-white"
                aria-hidden="true"
              >
                {assignee.name[0].toUpperCase()}
              </div>
              <span className="ml-2">{assignee.name}</span>
            </div>
          </div>
        )}

        <CardComments cardId={card.id} />

        <DialogFooter className="gap-2 flex-col sm:flex-row sm:justify-between mt-4">
          <div className="w-full sm:w-auto order-2 sm:order-1">
            {availableColumns.length > 0 && (
              <DropdownMenu open={moveMenuOpen} onOpenChange={setMoveMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <MoveRight className="mr-2 h-4 w-4" />
                    Mover para
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                  {availableColumns.map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => handleMoveCardToColumn(column.id)}
                      className="flex items-center gap-1"
                    >
                      <ArrowRightCircle className="h-4 w-4 mr-1" />
                      {column.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="order-1 sm:order-2">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
