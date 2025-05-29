import { Button } from "@/components/ui/button";
import { Search, Plus, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface OrientacoesEmptyStateProps {
  hasFilters: boolean;
}

export function OrientacoesEmptyState({ hasFilters }: OrientacoesEmptyStateProps) {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center py-12 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
        className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-lg"
      >
        {hasFilters ? (
          <Search className="h-8 w-8 text-primary" />
        ) : (
          <FileText className="h-8 w-8 text-primary" />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4 max-w-md mx-auto"
      >
        <h3 className="font-semibold text-xl text-foreground">
          {hasFilters ? "Nenhuma orientação encontrada" : "Nenhuma orientação ainda"}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {hasFilters 
            ? "Tente ajustar os filtros de busca ou verificar a ortografia dos termos pesquisados"
            : "Comece criando sua primeira orientação para organizar e compartilhar informações importantes com a equipe"
          }
        </p>

        {!hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="pt-4"
          >
            <Button 
              size={isMobile ? "default" : "lg"} 
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 btn-hover-scale px-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Orientação
            </Button>
          </motion.div>
        )}

        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="pt-2"
          >
            <Button 
              variant="outline" 
              size="sm"
              className="border-border/60 hover:bg-muted/50 transition-all duration-300"
            >
              Limpar filtros
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.02, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500 rounded-full blur-3xl"
        />
      </div>
    </motion.div>
  );
}
