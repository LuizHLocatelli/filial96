
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateCardData, TaskCard, validatePriority } from '../types';

export function useCardActions(cards: TaskCard[], setCards: React.Dispatch<React.SetStateAction<TaskCard[]>>) {
  const { profile } = useAuth();

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
      
      // Log activity if we have a profile
      if (profile) {
        const movedCard = cards.find(card => card.id === cardId);
        const targetColumn = movedCard ? await getColumnNameById(newColumnId) : null;
        
        if (movedCard && targetColumn) {
          const boardId = await getBoardIdByColumnId(newColumnId);
          if (boardId) {
            await supabase.from('crediario_kanban_activities').insert({
              board_id: boardId,
              card_id: cardId,
              action: 'card_moved',
              details: { 
                card_title: movedCard.title,
                column_name: targetColumn,
              },
              created_by: profile.id,
            });
          }
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
    if (!profile) return null;
    
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
        return null;
      }
      
      // Ensure proper typing of the new card
      const newCard: TaskCard = {
        ...data,
        priority: validatePriority(data.priority)
      };
      
      setCards([...cards, newCard]);
      
      // Log activity
      const boardId = await getBoardIdByColumnId(cardData.column_id);
      if (boardId) {
        await supabase.from('crediario_kanban_activities').insert({
          board_id: boardId,
          card_id: data.id,
          action: 'card_created',
          details: { card_title: data.title },
          created_by: profile.id,
        });
      }
      
      return newCard;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
      return null;
    }
  };
  
  // Helper function to get column name by ID
  const getColumnNameById = async (columnId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('crediario_kanban_columns')
        .select('name')
        .eq('id', columnId)
        .single();
        
      if (error || !data) {
        console.error('Error fetching column:', error);
        return null;
      }
      
      return data.name;
    } catch (error) {
      console.error('Error fetching column name:', error);
      return null;
    }
  };
  
  // Helper function to get board ID by column ID
  const getBoardIdByColumnId = async (columnId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('crediario_kanban_columns')
        .select('board_id')
        .eq('id', columnId)
        .single();
        
      if (error || !data) {
        console.error('Error fetching board ID:', error);
        return null;
      }
      
      return data.board_id;
    } catch (error) {
      console.error('Error fetching board ID:', error);
      return null;
    }
  };

  return { moveCardToColumn, updateCardPosition, addCard };
}
