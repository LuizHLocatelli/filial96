
import { useState } from "react";
import { Column, TaskCard } from "./types";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  column: Column;
  cards: TaskCard[];
  onAddCard?: (columnId: string) => void;  // Updated to accept columnId parameter
  onDeleteCard?: (card: TaskCard) => void;
  onUpdateCard?: (cardId: string, updates: Partial<TaskCard>) => void;
  onMoveCard?: (cardId: string, targetColumnId: string) => void;
  otherColumns?: Column[];
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onMoveCard,
  otherColumns = []
}: KanbanColumnProps) {
  const { isDarkMode } = useTheme();
  const [hovering, setHovering] = useState(false);
  const columnCards = cards.filter(card => card.column_id === column.id);

  // Função para ordenar cartões
  const sortedCards = [...columnCards].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    
    // Se as posições forem iguais, ordena pela data de criação
    const dateA = new Date(a.created_at || '');
    const dateB = new Date(b.created_at || '');
    return dateB.getTime() - dateA.getTime();
  });
  
  // Determine o estilo do cabeçalho baseado na coluna
  const getHeaderStyle = () => {
    switch(column.id) {
      case 'a_fazer':
        return 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30';
      case 'fazendo':
        return 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30';
      case 'feita':
        return 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/30';
      default:
        return 'border-gray-300 dark:border-gray-700';
    }
  };
  
  // Determine o estilo do badge baseado na coluna
  const getBadgeStyle = () => {
    switch(column.id) {
      case 'a_fazer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'fazendo':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'feita':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return '';
    }
  };

  return (
    <div 
      className="flex flex-col h-full max-h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm border dark:border-gray-700"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{width: '100%'}}
    >
      <div className={`flex justify-between items-center p-3 border-b dark:border-gray-700 border-l-4 ${getHeaderStyle()}`}>
        <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
          {column.name}
          <Badge variant="outline" className={getBadgeStyle()}>
            {sortedCards.length}
          </Badge>
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
            <DropdownMenuItem 
              onClick={() => onAddCard && onAddCard(column.id)}
              className="dark:hover:bg-gray-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Adicionar Cartão</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 p-2 h-[calc(100%-100px)]">
        <div className="space-y-2 pr-2">
          {sortedCards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={() => onDeleteCard && onDeleteCard(card)}
              onUpdate={(cardId, updates) => onUpdateCard && onUpdateCard(cardId, updates)}
              onMoveCard={onMoveCard}
            />
          ))}
        </div>
      </ScrollArea>

      <Button
        onClick={() => onAddCard && onAddCard(column.id)}
        className={`m-2 gap-1 bg-primary-100 hover:bg-primary-200 text-primary-600 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 dark:text-primary-300 w-full justify-center rounded-md transition-all ${
          hovering ? 'shadow-md' : ''
        }`}
        variant="outline"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        <span>Adicionar Cartão</span>
      </Button>
    </div>
  );
}
