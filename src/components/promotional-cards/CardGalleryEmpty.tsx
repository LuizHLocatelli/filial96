import { Plus, FolderOpen, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CardGalleryEmptyProps {
  folderId: string | null;
  onCreateCard: () => void;
}

export function CardGalleryEmpty({ folderId, onCreateCard }: CardGalleryEmptyProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
            {folderId ? (
              <FolderOpen className="h-14 w-14 text-primary" />
            ) : (
              <Image className="h-14 w-14 text-primary" />
            )}
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="absolute -top-2 -right-2 w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg"
          >
            <Plus className="h-5 w-5 text-primary-foreground" />
          </motion.div>
        </motion.div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">
            {folderId ? "Pasta vazia" : "Nenhum card encontrado"}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            {folderId 
              ? "Esta pasta ainda não possui cards promocionais. Adicione o primeiro card para começar!"
              : "Você ainda não criou nenhum card promocional. Comece criando seu primeiro card agora!"
            }
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={onCreateCard}
            variant="success"
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Criar Primeiro Card
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
