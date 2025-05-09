
import { useCards } from "@/hooks/useCards";
import { useCardOperations } from "@/hooks/useCardOperations";
import { CardGrid } from "@/components/promotional-cards/CardGrid";
import { CardGalleryEmpty } from "@/components/promotional-cards/CardGalleryEmpty";
import { CardGalleryLoading } from "@/components/promotional-cards/CardGalleryLoading";

interface CardGalleryProps {
  sector: "furniture" | "fashion";
  folderId: string | null;
}

export function CardGallery({ sector, folderId }: CardGalleryProps) {
  const { cards, setCards, isLoading } = useCards(sector, folderId);
  const { deleteCard, moveCardToFolder } = useCardOperations();

  const handleDeleteCard = async (id: string) => {
    return deleteCard(id, setCards);
  };

  const handleMoveToFolder = async (cardId: string, newFolderId: string | null) => {
    return moveCardToFolder(cardId, newFolderId, setCards);
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
