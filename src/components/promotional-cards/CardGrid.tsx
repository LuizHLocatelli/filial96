
import { PromotionalCard } from "@/components/promotional-cards/PromotionalCard";
import { CardItem } from "@/hooks/useCardOperations";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface CardGridProps {
  cards: CardItem[];
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, newFolderId: string | null) => Promise<boolean>;
  sector: "furniture" | "fashion" | "loan" | "service";
}

export function CardGrid({ cards, onDelete, onMoveToFolder, sector }: CardGridProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <PromotionalCard
            id={card.id}
            title={card.title}
            code={card.code}
            promotionDate={card.promotion_date}
            imageUrl={card.image_url}
            folderId={card.folder_id}
            onDelete={onDelete}
            onMoveToFolder={onMoveToFolder}
            sector={sector}
            isMobile={isMobile}
          />
        </motion.div>
      ))}
    </div>
  );
}
