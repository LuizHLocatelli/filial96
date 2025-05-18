
import React from 'react';
import { Column, TaskCard } from "../types";
import { KanbanColumn } from "../KanbanColumn";
import { useTheme } from "@/contexts/ThemeContext";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnListProps {
  columns: Column[];
  cards: TaskCard[];
  onAddCard: (columnId: string) => void;
  onDeleteCard: (card: TaskCard) => void;
  onUpdateCard: (cardId: string, updates: Partial<TaskCard>) => void;
  onMoveCard?: (cardId: string, targetColumnId: string) => void;
}

export function ColumnList({
  columns,
  cards,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onMoveCard
}: ColumnListProps) {
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();
  
  // Ordenar colunas pela posição
  const sortedColumns = [...columns].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    return 0;
  });

  return isMobile ? (
    // Layout móvel com rolagem vertical para cada coluna
    <div 
      className={`flex flex-col gap-4 p-2 rounded-lg ${
        isDarkMode 
          ? 'bg-gray-900/40 backdrop-blur-sm shadow-inner border border-gray-800' 
          : 'bg-gray-100/60 border border-gray-200'
      }`}
    >
      {sortedColumns.map(column => (
        <div key={column.id} className="min-h-[350px] h-auto">
          <KanbanColumn
            column={column}
            cards={cards}
            onAddCard={onAddCard}
            onDeleteCard={onDeleteCard}
            onUpdateCard={onUpdateCard}
            onMoveCard={onMoveCard}
          />
        </div>
      ))}
    </div>
  ) : (
    // Layout desktop com colunas redimensionáveis
    <div 
      className={`rounded-lg ${
        isDarkMode 
          ? 'bg-gray-900/40 backdrop-blur-sm shadow-inner border border-gray-800' 
          : 'bg-gray-100/60 border border-gray-200'
      }`}
    >
      <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-250px)]">
        {sortedColumns.map((column, index) => (
          <React.Fragment key={column.id}>
            <ResizablePanel defaultSize={100 / sortedColumns.length} minSize={25}>
              <KanbanColumn
                column={column}
                cards={cards}
                onAddCard={onAddCard}
                onDeleteCard={onDeleteCard}
                onUpdateCard={onUpdateCard}
                onMoveCard={onMoveCard}
              />
            </ResizablePanel>
            
            {/* Adicionar separadores entre os painéis, exceto após o último */}
            {index < sortedColumns.length - 1 && (
              <ResizableHandle withHandle />
            )}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
}
