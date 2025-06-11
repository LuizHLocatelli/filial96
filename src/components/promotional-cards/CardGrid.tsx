import { PromotionalCard } from "@/components/promotional-cards/PromotionalCard";
import { CardItem } from "@/hooks/useCardOperations";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface CardGridProps {
  cards: CardItem[];
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, newFolderId: string | null) => Promise<boolean>;
  sector: "furniture" | "fashion" | "loan" | "service";
  onUpdate: () => void;
}

export function CardGrid({ cards, onDelete, onMoveToFolder, sector, onUpdate }: CardGridProps) {
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
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
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
            onDelete={onDelete}
            onMoveToFolder={onMoveToFolder}
            sector={sector}
            isMobile={isMobile}
            onUpdate={onUpdate}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
