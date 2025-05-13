
import { useState } from 'react';
import { TaskCard } from './types';
import { useBoardData } from './hooks/useBoardData';
import { useColumnActions } from './hooks/useColumnActions';
import { useCardActions } from './hooks/useCardActions';

export function useKanbanBoard() {
  const { board, columns, cards, isLoading, setCards } = useBoardData();
  const [activeCard, setActiveCard] = useState<TaskCard | null>(null);
  const { addColumn, updateColumnPosition } = useColumnActions(columns, setColumns => setColumns);
  const { moveCardToColumn, updateCardPosition, addCard } = useCardActions(cards, setCards);
  
  return {
    board,
    columns,
    cards,
    isLoading,
    activeCard,
    setActiveCard,
    addColumn,
    updateColumnPosition,
    moveCardToColumn,
    updateCardPosition,
    addCard,
  };
}
