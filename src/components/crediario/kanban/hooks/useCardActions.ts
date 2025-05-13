
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateCardData, TaskCard, validatePriority } from '../types';

export function useCardActions(cards: TaskCard[], setCards: React.Dispatch<React.SetStateAction<TaskCard[]>>) {
  const { profile } = useAuth();
  
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

  return { addCard };
}
