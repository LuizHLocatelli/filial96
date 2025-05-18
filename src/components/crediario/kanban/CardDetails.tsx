import { useState, useEffect } from "react";
import { TaskCard } from "./types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUsers } from "./useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Clock, User, CheckCircle, Pencil, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";

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
  onMoveCard
}: CardDetailsProps) {
  const [dueDateFormatted, setDueDateFormatted] = useState<string | null>(null);
  const { usersData } = useUsers();
  const { isDarkMode } = useTheme();
  
  const assignee = card.assignee_id 
    ? usersData.find(user => user.id === card.assignee_id) 
    : null;

  useEffect(() => {
    if (card.due_date) {
      try {
        const formattedDate = format(new Date(card.due_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
        setDueDateFormatted(formattedDate);
      } catch (error) {
        console.error("Error formatting date:", error);
        setDueDateFormatted(null);
      }
    } else {
      setDueDateFormatted(null);
    }
  }, [card.due_date]);
  
  // Adicionando a função para mover o cartão
  const handleMoveCard = (columnId: string) => {
    if (onMoveCard) {
      onMoveCard(card.id, columnId);
      onOpenChange(false); // Fechar o diálogo após mover
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{card.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de Status - Nova seção para mover entre colunas */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={card.column_id === 'a_fazer' ? "default" : "outline"}
                onClick={() => handleMoveCard('a_fazer')}
              >
                A Fazer
              </Button>
              <Button 
                size="sm" 
                variant={card.column_id === 'fazendo' ? "default" : "outline"}
                onClick={() => handleMoveCard('fazendo')}
              >
                Fazendo
              </Button>
              <Button 
                size="sm" 
                variant={card.column_id === 'feita' ? "default" : "outline"}
                onClick={() => handleMoveCard('feita')}
              >
                Feita
              </Button>
            </div>
          </div>

          {/* Informações do Cartão */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</h3>
            <p className="text-gray-800 dark:text-gray-200">{card.description || "Nenhuma descrição fornecida."}</p>
          </div>

          {/* Data de Vencimento */}
          {dueDateFormatted && (
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Vencimento: {dueDateFormatted}
              </span>
            </div>
          )}

          {/* Responsável */}
          {assignee && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Avatar className="h-5 w-5">
                <AvatarImage src={assignee.avatar_url || ""} alt={assignee.name} />
                <AvatarFallback className="text-[10px] bg-primary/20 dark:bg-primary/30">
                  {assignee.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Responsável: {assignee.name}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
