
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Board, Column, TaskCard, CreateCardData, validatePriority } from './types';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export function useKanbanBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<TaskCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<TaskCard | null>(null);
  const { profile } = useAuth();
  
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
  
  // Add a new column
  const addColumn = async (name: string) => {
    if (!board || !profile) return;
    
    try {
      const newPosition = columns.length;
      
      const { data, error } = await supabase
        .from('crediario_kanban_columns')
        .insert({
          board_id: board.id,
          name,
          position: newPosition,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding column:', error);
        toast.error('Erro ao adicionar coluna');
        return;
      }
      
      setColumns([...columns, data]);
      
      // Log activity
      await supabase.from('crediario_kanban_activities').insert({
        board_id: board.id,
        action: 'column_created',
        details: { column_name: name },
        created_by: profile.id,
      });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  // Update column position
  const updateColumnPosition = async (columnId: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('crediario_kanban_columns')
        .update({ position: newPosition })
        .eq('id', columnId);
        
      if (error) {
        console.error('Error updating column position:', error);
        toast.error('Erro ao atualizar posição da coluna');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  // Move a card to a different column
  const moveCardToColumn = async (cardId: string, newColumnId: string) => {
    try {
      const cardsInTargetColumn = cards.filter(card => card.column_id === newColumnId);
      const newPosition = cardsInTargetColumn.length;
      
      const { error } = await supabase
        .from('crediario_kanban_cards')
        .update({ 
          column_id: newColumnId,
          position: newPosition,
        })
        .eq('id', cardId);
        
      if (error) {
        console.error('Error moving card:', error);
        toast.error('Erro ao mover cartão');
        return;
      }
      
      // Update local state
      setCards(cards.map(card => 
        card.id === cardId 
          ? { ...card, column_id: newColumnId, position: newPosition } 
          : card
      ));
      
      // Log activity if we have a board and profile
      if (board && profile) {
        const movedCard = cards.find(card => card.id === cardId);
        const targetColumn = columns.find(col => col.id === newColumnId);
        
        if (movedCard && targetColumn) {
          await supabase.from('crediario_kanban_activities').insert({
            board_id: board.id,
            card_id: cardId,
            action: 'card_moved',
            details: { 
              card_title: movedCard.title,
              column_name: targetColumn.name,
            },
            created_by: profile.id,
          });
        }
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  // Update card position within the same column
  const updateCardPosition = async (cardId: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('crediario_kanban_cards')
        .update({ position: newPosition })
        .eq('id', cardId);
        
      if (error) {
        console.error('Error updating card position:', error);
        toast.error('Erro ao atualizar posição do cartão');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  // Add a new card
  const addCard = async (cardData: CreateCardData) => {
    if (!profile) return;
    
    try {
      const cardsInColumn = cards.filter(card => card.column_id === cardData.column_id);
      const newPosition = cardsInColumn.length;
      
      const { data, error } = await supabase
        .from('crediario_kanban_cards')
        .insert({
          ...cardData,
          // Validate priority before inserting
          priority: validatePriority(cardData.priority),
          position: newPosition,
          created_by: profile.id,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding card:', error);
        toast.error('Erro ao adicionar cartão');
        return;
      }
      
      // Ensure proper typing of the new card
      const newCard: TaskCard = {
        ...data,
        priority: validatePriority(data.priority)
      };
      
      setCards([...cards, newCard]);
      
      // Log activity
      if (board) {
        await supabase.from('crediario_kanban_activities').insert({
          board_id: board.id,
          card_id: data.id,
          action: 'card_created',
          details: { card_title: data.title },
          created_by: profile.id,
        });
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
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
