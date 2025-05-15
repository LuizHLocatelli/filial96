
import { supabase } from "@/integrations/supabase/client";

export interface CardItem {
  id: string;
  title: string;
  image_url: string;
  folder_id: string | null;
  position: number;
  code: string;
  promotion_date: string | null;
  created_by: string;
  created_at: string;
}

export function useCardOperations() {
  const deleteCard = async (id: string) => {
    try {
      // First, get the card to find its image URL
      const { data: cardData, error: cardError } = await supabase
        .from('promotional_cards')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (cardError) throw cardError;
      
      // Delete the card from the database
      const { error: deleteError } = await supabase
        .from('promotional_cards')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Extract file path from image URL
      const imageUrl = cardData.image_url;
      const filePath = imageUrl.split('/').slice(-2).join('/');
      
      // Delete the image from storage
      if (filePath) {
        const { error: storageError } = await supabase
          .storage
          .from('promotional_cards')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error removing image from storage:', storageError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  };

  const moveCardToFolder = async (cardId: string, newFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from('promotional_cards')
        .update({ folder_id: newFolderId })
        .eq('id', cardId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error moving card to folder:', error);
      return false;
    }
  };

  return { deleteCard, moveCardToFolder };
}
