
import { useBoardData } from './hooks/useBoardData';
import { useColumnActions } from './hooks/useColumnActions';
import { useCardActions } from './hooks/useCardActions';

export function useKanbanBoard() {
  const { board, columns, cards, isLoading, setCards } = useBoardData();
  const { addColumn } = useColumnActions(columns, setColumns => setColumns);
  const { addCard } = useCardActions(cards, setCards);
  
  return {
    board,
    columns,
    cards,
    isLoading,
    addColumn,
    addCard,
  };
}
