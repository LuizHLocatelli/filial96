
import { useState } from "react";
import { Column, TaskCard } from "./types";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Plus } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface KanbanColumnProps {
  column: Column;
  cards: TaskCard[];
  onAddCard: (columnId: string) => void;
  onDeleteCard: (card: TaskCard) => void;
  onUpdateCard: (cardId: string, updates: Partial<TaskCard>) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
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

  const handleEditClick = () => {
    onEditColumn(column);
  };

  const handleDeleteClick = () => {
    onDeleteColumn(column.id);
  };

  return (
    <div 
      className="flex flex-col min-w-[280px] w-[280px] h-full max-h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm border dark:border-gray-700"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">
          {column.name} <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({sortedCards.length})</span>
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
            <DropdownMenuItem onClick={handleEditClick} className="dark:hover:bg-gray-700">
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <DropdownMenuItem 
              onClick={handleDeleteClick}
              className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {sortedCards.map(card => (
          <KanbanCard
            key={card.id}
            card={card}
            onDelete={() => onDeleteCard(card)}
            onUpdate={(cardId, updates) => onUpdateCard(cardId, updates)}
          />
        ))}
      </div>

      <Button
        onClick={() => onAddCard(column.id)}
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
