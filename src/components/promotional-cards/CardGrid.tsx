import { PromotionalCard } from "@/components/promotional-cards/PromotionalCard";
import { CardItem } from "@/hooks/useCardOperations";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardGridProps {
  cards: CardItem[];
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, folderId: string | null) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<CardItem>) => Promise<boolean>;
  sector: "furniture" | "fashion" | "loan" | "service";
  folderMap?: Map<string, string>;
}

export function CardGrid({ cards, onDelete, onMoveToFolder, onUpdate, sector, folderMap }: CardGridProps) {
  const isMobile = useIsMobile();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.div 
      layout
      className={cn(
        "grid gap-3 sm:gap-4",
        isMobile 
          ? "grid-cols-2" 
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            variants={itemVariants}
            layout
            exit="exit"
            className="animate-in"
          >
            <PromotionalCard
              id={card.id}
              title={card.title}
              code={card.code}
              startDate={card.start_date}
              endDate={card.end_date}
              imageUrl={card.image_url}
              folderId={card.folder_id}
              folderName={card.folder_id ? folderMap?.get(card.folder_id) : null}
              aspectRatio={card.aspect_ratio}
              onDelete={onDelete}
              onMoveToFolder={onMoveToFolder}
              onUpdate={onUpdate}
              sector={sector}
              isMobile={isMobile}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
