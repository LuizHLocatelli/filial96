import { PromotionalCard } from "@/components/promotional-cards/PromotionalCard";
import { CardItem } from "@/hooks/useCardOperations";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardGridProps {
  cards: CardItem[];
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, folderId: string | null) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<CardItem>) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
}

export function CardGrid({ cards, onDelete, onMoveToFolder, onUpdate, sector }: CardGridProps) {
  const isMobile = useIsMobile();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    }
  };
  
  return (
    <motion.div 
      className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => (
        <motion.div
          key={card.id}
          variants={itemVariants}
          layout
        >
          <PromotionalCard
            id={card.id}
            title={card.title}
            code={card.code}
            startDate={card.start_date}
            endDate={card.end_date}
            imageUrl={card.image_url}
            folderId={card.folder_id}
            aspectRatio={card.aspect_ratio}
            onDelete={onDelete}
            onMoveToFolder={onMoveToFolder}
            onUpdate={(id, updates) => onUpdate(id, updates)}
            sector={sector}
            isMobile={isMobile}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
