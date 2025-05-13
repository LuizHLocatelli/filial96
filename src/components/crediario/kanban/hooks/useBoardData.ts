
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Board, Column, TaskCard, validatePriority } from '../types';
import { toast } from 'sonner';

export function useBoardData() {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<TaskCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch board, columns and cards
  useEffect(() => {
    async function fetchBoardData() {
      setIsLoading(true);
      try {
        // Fetch the default board
        const { data: boardData, error: boardError } = await supabase
          .from('crediario_kanban_boards')
          .select('*')
          .limit(1)
          .single();
          
        if (boardError) {
          console.error('Error fetching board:', boardError);
          toast.error('Erro ao carregar o quadro');
          setIsLoading(false);
          return;
        }
        
        setBoard(boardData);
        
        // Fetch columns for the board
        const { data: columnsData, error: columnsError } = await supabase
          .from('crediario_kanban_columns')
          .select('*')
          .eq('board_id', boardData.id)
          .order('position', { ascending: true });
          
        if (columnsError) {
          console.error('Error fetching columns:', columnsError);
          toast.error('Erro ao carregar as colunas');
          setIsLoading(false);
          return;
        }
        
        setColumns(columnsData);
        
        // Fetch cards for the board
        const { data: cardsData, error: cardsError } = await supabase
          .from('crediario_kanban_cards')
          .select('*')
          .in('column_id', columnsData.map(col => col.id))
          .order('position', { ascending: true });
          
        if (cardsError) {
          console.error('Error fetching cards:', cardsError);
          toast.error('Erro ao carregar os cartões');
          setIsLoading(false);
          return;
        }
        
        // Convert and validate priority
        const validatedCards: TaskCard[] = cardsData.map(card => ({
          ...card,
          priority: validatePriority(card.priority)
        }));
        
        setCards(validatedCards);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('Ocorreu um erro inesperado');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBoardData();
    
    // Set up realtime subscriptions
    const boardChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crediario_kanban_columns' }, 
        () => fetchBoardData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crediario_kanban_cards' }, 
        () => fetchBoardData()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(boardChannel);
    };
  }, []);

  return { board, columns, cards, isLoading, setCards };
}
