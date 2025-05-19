
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateCardData, TaskCard, validatePriority } from '../types';

export function useCardActions(cards: TaskCard[], setCards: React.Dispatch<React.SetStateAction<TaskCard[]>>) {
  const { profile } = useAuth();
  
  // Add a new card
  const addCard = async (cardData: CreateCardData) => {
    if (!profile) {
      toast.error('Você precisa estar autenticado para adicionar um cartão');
      return null;
    }
    
    try {
      console.log("Adicionando cartão no banco de dados:", cardData);
      
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
          // Include the background color if provided
          background_color: cardData.background_color,
          // Include the due_time field
          due_time: cardData.due_time
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding card:', error);
        toast.error('Erro ao adicionar cartão: ' + error.message);
        return null;
      }
      
      console.log("Cartão adicionado com sucesso:", data);
      
      // Ensure proper typing of the new card
      const newCard: TaskCard = {
        ...data,
        priority: validatePriority(data.priority)
      };
      
      setCards(prevCards => [...prevCards, newCard]);
      
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
      toast.error('Ocorreu um erro inesperado ao adicionar o cartão');
      return null;
    }
  };
  
  // Delete a card
  const deleteCard = async (cardId: string) => {
    try {
      // First remove the card from state for immediate feedback
      setCards(cards.filter(card => card.id !== cardId));
      
      // Then delete from the database
      const { error } = await supabase
        .from('crediario_kanban_cards')
        .delete()
        .eq('id', cardId);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Erro ao excluir o cartão');
      return false;
    }
  };
  
  // Update a card
  const updateCard = async (cardId: string, updates: Partial<TaskCard>) => {
    try {
      // First update in local state for immediate feedback
      setCards(cards.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      ));
      
      // Then update in the database
      const { error } = await supabase
        .from('crediario_kanban_cards')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Erro ao atualizar o cartão');
      return false;
    }
  };
  
  // Move card to another column
  const moveCard = async (cardId: string, targetColumnId: string) => {
    try {
      if (!profile) {
        toast.error('Você precisa estar autenticado para mover um cartão');
        return false;
      }
      
      const cardToMove = cards.find(card => card.id === cardId);
      if (!cardToMove) {
        toast.error('Cartão não encontrado');
        return false;
      }
      
      // Skip if the card is already in the target column
      if (cardToMove.column_id === targetColumnId) {
        return true;
      }
      
      // Calculate new position in target column
      const cardsInTargetColumn = cards.filter(card => card.column_id === targetColumnId);
      const newPosition = cardsInTargetColumn.length;
      
      // First update in local state for immediate feedback
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === cardId 
            ? { ...card, column_id: targetColumnId, position: newPosition } 
            : card
        )
      );
      
      // Then update in the database
      const { error } = await supabase
        .from('crediario_kanban_cards')
        .update({
          column_id: targetColumnId,
          position: newPosition,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId);
        
      if (error) {
        throw error;
      }
      
      // Log activity if possible
      const boardId = await getBoardIdByColumnId(targetColumnId);
      if (boardId && profile) {
        await supabase.from('crediario_kanban_activities').insert({
          board_id: boardId,
          card_id: cardId,
          action: 'card_moved',
          details: { 
            card_title: cardToMove.title,
            from_column: cardToMove.column_id,
            to_column: targetColumnId
          },
          created_by: profile.id,
        });
      }
      
      toast.success('Cartão movido com sucesso');
      return true;
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Erro ao mover o cartão');
      return false;
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

  return { addCard, deleteCard, updateCard, moveCard };
}
