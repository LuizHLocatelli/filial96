
import { useBoardData } from './hooks/useBoardData';
import { useColumnActions } from './hooks/useColumnActions';
import { useCardActions } from './hooks/useCardActions';

export function useKanbanBoard() {
  const { board, columns, cards, isLoading, setCards } = useBoardData();
  const { addColumn, editColumn, deleteColumn } = useColumnActions(columns, () => {}); // We don't use setColumns from this hook
  const { addCard, deleteCard, updateCard } = useCardActions(cards, setCards);
  
  return {
    board,
    columns,
    cards,
    isLoading,
    setCards,
    addColumn,
    editColumn,
    deleteColumn,
    addCard,
    deleteCard,
    updateCard
  };
}
