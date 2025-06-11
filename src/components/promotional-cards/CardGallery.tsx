import { useCardOperations, CardItem } from "@/hooks/useCardOperations";
import { useCardSearch } from "@/hooks/useCardSearch";
import { CardGrid } from "@/components/promotional-cards/CardGrid";
import { CardGalleryEmpty } from "@/components/promotional-cards/CardGalleryEmpty";
import { CardGalleryLoading } from "@/components/promotional-cards/CardGalleryLoading";
import { CardSearchBar } from "@/components/promotional-cards/CardSearchBar";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface CardGalleryProps {
  sector: "furniture" | "fashion" | "loan" | "service";
  folderId: string | null;
  cards: CardItem[];
  setCards: React.Dispatch<React.SetStateAction<CardItem[]>>;
  isLoading: boolean;
}

export function CardGallery({ sector, folderId, cards, setCards, isLoading }: CardGalleryProps) {
  const { deleteCard, moveCardToFolder } = useCardOperations();
  const { searchTerm, setSearchTerm, filteredCards, hasResults, isSearching } = useCardSearch(cards);
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
        if (folderId && !newFolderId) {
          setCards(prevCards => prevCards.filter(card => card.id !== cardId));
        } else if (!folderId) {
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

  const handleUpdateCard = (id: string, newTitle: string) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, title: newTitle } : card
      )
    );
  };

  if (isLoading) {
    return <CardGalleryLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Barra de pesquisa */}
      {cards.length > 0 && (
        <CardSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultsCount={filteredCards.length}
          totalCount={cards.length}
          isSearching={isSearching}
        />
      )}

      {/* Resultados */}
      {cards.length === 0 ? (
        <CardGalleryEmpty folderId={folderId} />
      ) : !hasResults && isSearching ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-2">Nenhum card encontrado</p>
            <p className="text-sm">
              Tente pesquisar com outros termos ou verifique a ortografia.
            </p>
          </div>
        </div>
      ) : (
        <CardGrid 
          cards={filteredCards}
          onDelete={handleDeleteCard}
          onMoveToFolder={handleMoveToFolder}
          onUpdate={handleUpdateCard}
          sector={sector}
        />
      )}
    </div>
  );
}
