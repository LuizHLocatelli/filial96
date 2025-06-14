
import { motion } from "framer-motion";
import { OrientacoesList } from "@/components/moveis/orientacoes/OrientacoesList";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrientacoesTabContentProps {
  onShowAddOrientacaoDialog: () => void;
}

export function OrientacoesTabContent({ onShowAddOrientacaoDialog }: OrientacoesTabContentProps) {
  const isMobile = useIsMobile();
  return (
    <div className="bg-gradient-to-br from-background to-blue-50/20 dark:to-blue-950/20">
      <div className="p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              VM e Informativos
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie orientações e informativos da empresa com facilidade
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onShowAddOrientacaoDialog}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl glass-button-effect"
              size={isMobile ? "sm" : "default"}
            >
              <Upload className="h-4 w-4 mr-2" />
              Novo Informativo
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="glass-card rounded-xl p-4 sm:p-6 border border-blue-200/20 dark:border-blue-800/20 shadow-soft"
        >
          <OrientacoesList />
        </motion.div>
      </div>
    </div>
  );
}
