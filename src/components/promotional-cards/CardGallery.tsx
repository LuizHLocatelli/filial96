
import { useCards } from "@/hooks/useCards";
import { useCardOperations } from "@/hooks/useCardOperations";
import { CardGrid } from "@/components/promotional-cards/CardGrid";
import { CardGalleryEmpty } from "@/components/promotional-cards/CardGalleryEmpty";
import { CardGalleryLoading } from "@/components/promotional-cards/CardGalleryLoading";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface CardGalleryProps {
  sector: "furniture" | "fashion";
  folderId: string | null;
}

export function CardGallery({ sector, folderId }: CardGalleryProps) {
  const { cards, setCards, isLoading } = useCards(sector, folderId);
  const { deleteCard, moveCardToFolder } = useCardOperations();
  const [processingCardIds, setProcessingCardIds] = useState<Set<string>>(new Set());

  const handleDeleteCard = async (id: string) => {
    if (processingCardIds.has(id)) return false;
    
    setProcessingCardIds(prev => new Set(prev).add(id));
    try {
      const success = await deleteCard(id);
      
      if (success) {
        setCards(prevCards => prevCards.filter(card => card.id !== id));
        toast({
          title: "Sucesso",
          description: "Card promocional excluído com sucesso"
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o card promocional",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleMoveToFolder = async (cardId: string, newFolderId: string | null) => {
    if (processingCardIds.has(cardId)) return false;
    
    setProcessingCardIds(prev => new Set(prev).add(cardId));
    try {
      const success = await moveCardToFolder(cardId, newFolderId);
      
      if (success) {
        // If we're viewing a folder and moving out of it, we should remove the card from the list
        if (folderId && !newFolderId) {
          setCards(prevCards => prevCards.filter(card => card.id !== cardId));
        } 
        // If we're viewing all cards and moving to a folder, update the folder_id
        else if (!folderId) {
          setCards(prevCards => prevCards.map(card => 
            card.id === cardId 
              ? {...card, folder_id: newFolderId}
              : card
          ));
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error moving card to folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o card",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return <CardGalleryLoading />;
  }

  if (cards.length === 0) {
    return <CardGalleryEmpty folderId={folderId} />;
  }

  return (
    <CardGrid 
      cards={cards}
      onDelete={handleDeleteCard}
      onMoveToFolder={handleMoveToFolder}
      sector={sector}
    />
  );
}
