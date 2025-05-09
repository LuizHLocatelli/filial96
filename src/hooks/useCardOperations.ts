
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface CardItem {
  id: string;
  title: string;
  image_url: string;
  folder_id: string | null;
  position: number;
}

export function useCardOperations() {
  const deleteCard = async (id: string, setCards?: React.Dispatch<React.SetStateAction<CardItem[]>>) => {
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
      
      toast({
        title: "Sucesso",
        description: "Card promocional excluído com sucesso"
      });
      
      // Update local state if provided
      if (setCards) {
        setCards(prevCards => prevCards.filter(card => card.id !== id));
      }

      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o card promocional",
        variant: "destructive"
      });
      return false;
    }
  };

  const moveCardToFolder = async (
    cardId: string, 
    newFolderId: string | null,
    setCards?: React.Dispatch<React.SetStateAction<CardItem[]>>
  ) => {
    try {
      const { error } = await supabase
        .from('promotional_cards')
        .update({ folder_id: newFolderId })
        .eq('id', cardId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: newFolderId ? "Card movido para a pasta com sucesso" : "Card removido da pasta com sucesso"
      });
      
      // Update local state if provided
      if (setCards) {
        setCards(prevCards => prevCards.map(card => 
          card.id === cardId 
            ? {...card, folder_id: newFolderId}
            : card
        ));
      }

      return true;
    } catch (error) {
      console.error('Error moving card to folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o card",
        variant: "destructive"
      });
      return false;
    }
  };

  return { deleteCard, moveCardToFolder };
}
