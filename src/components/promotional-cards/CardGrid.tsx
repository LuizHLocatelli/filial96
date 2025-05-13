
import { PromotionalCard } from "@/components/promotional-cards/PromotionalCard";
import { CardItem } from "@/hooks/useCardOperations";
import { useIsMobile } from "@/hooks/use-mobile";

interface CardGridProps {
  cards: CardItem[];
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, newFolderId: string | null) => Promise<boolean>;
  sector: "furniture" | "fashion";
}

export function CardGrid({ cards, onDelete, onMoveToFolder, sector }: CardGridProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      {cards.map(card => (
        <PromotionalCard
          key={card.id}
          id={card.id}
          title={card.title}
          code={card.code}
          promotionDate={card.promotion_date}
          imageUrl={card.image_url}
          folderId={card.folder_id}
          onDelete={() => onDelete(card.id)}
          onMoveToFolder={onMoveToFolder}
          sector={sector}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}
