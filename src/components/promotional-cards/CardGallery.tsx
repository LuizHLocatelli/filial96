import { useCardOperations, CardItem, CardUpdateData } from "@/hooks/useCardOperations";
import { useCardSearch } from "@/hooks/useCardSearch";
import { useFolders } from "@/hooks/useFolders";
import { CardGrid } from "@/components/promotional-cards/CardGrid";
import { CardGalleryEmpty } from "@/components/promotional-cards/CardGalleryEmpty";
import { CardGalleryLoading } from "@/components/promotional-cards/CardGalleryLoading";
import { CardSearchBar } from "@/components/promotional-cards/CardSearchBar";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface CardGalleryProps {
  sector: "furniture" | "fashion" | "loan" | "service";
  folderId: string | null;
  cards: CardItem[];
  setCards: React.Dispatch<React.SetStateAction<CardItem[]>>;
  isLoading: boolean;
  onCreateCard: () => void;
}

export function CardGallery({ sector, folderId, cards, setCards, isLoading, onCreateCard }: CardGalleryProps) {
  const { deleteCard, moveCardToFolder, updateCard } = useCardOperations();
  const { searchTerm, setSearchTerm, filteredCards, hasResults, isSearching } = useCardSearch(cards);
  const { folders } = useFolders(sector);
  const [processingCardIds, setProcessingCardIds] = useState<Set<string>>(new Set());

  const folderMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach(folder => {
      map.set(folder.id, folder.name);
    });
    return map;
  }, [folders]);

  const handleDeleteCard = async (id: string) => {
    if (processingCardIds.has(id)) return false;
    
    setProcessingCardIds(prev => new Set(prev).add(id));
    try {
      const success = await deleteCard(id);
      
      if (success) {
        setCards(prevCards => prevCards.filter(card => card.id !== id));
        toast.success("Sucesso", { description: "Card promocional excluído com sucesso" });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error deleting card:', error);
        toast.error("Erro", { description: "Não foi possível excluir o card promocional" });
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
      toast.error("Erro", { description: "Não foi possível mover o card" });
      return false;
    } finally {
      setProcessingCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }
  };

  const handleUpdateCard = async (id: string, updates: Partial<CardItem>) => {
    if (processingCardIds.has(id)) return false;
    
    setProcessingCardIds(prev => new Set(prev).add(id));
    try {
      const updateData: CardUpdateData = updates as CardUpdateData;
      
      const success = await updateCard(id, updateData);
      
      if (success) {
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === id ? { ...card, ...updates } : card
          )
        );
        toast.success("Sucesso", { description: "Card atualizado com sucesso" });
        return true;
      } else {
        toast.error("Erro", { description: "Não foi possível atualizar o card" });
        return false;
      }
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error("Erro", { description: "Não foi possível atualizar o card" });
      return false;
    } finally {
      setProcessingCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return <CardGalleryLoading />;
  }

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {cards.length > 0 && (
        <CardSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultsCount={filteredCards.length}
          totalCount={cards.length}
          isSearching={isSearching}
        />
      )}

      {cards.length === 0 ? (
        <CardGalleryEmpty folderId={folderId} onCreateCard={onCreateCard} />
      ) : !hasResults && isSearching ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 px-4"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-lg font-medium text-foreground mb-1">Nenhum card encontrado</p>
          <p className="text-sm text-muted-foreground">
            Tente pesquisar com outros termos ou verifique a ortografia.
          </p>
        </motion.div>
      ) : (
        <CardGrid 
          cards={filteredCards}
          onDelete={handleDeleteCard}
          onMoveToFolder={handleMoveToFolder}
          onUpdate={handleUpdateCard}
          sector={sector}
          folderMap={folderMap}
        />
      )}
    </motion.div>
  );
}
