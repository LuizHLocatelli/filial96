
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
    <div className="bg-gradient-to-br from-background to-green-50/10 dark:to-green-950/20">
      <div className="p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-end"
        >
          <Button
            onClick={onShowAddOrientacaoDialog}
            variant="success"
            size={isMobile ? "sm" : "default"}
          >
            <Upload className="h-4 w-4 mr-2" />
            Novo VM ou Informativo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="glass-card rounded-xl p-4 sm:p-6 border border-green-500/10 dark:border-green-400/20 shadow-soft"
        >
          <OrientacoesList />
        </motion.div>
      </div>
    </div>
  );
}
