import { motion } from "framer-motion";
import { OrientacoesList } from "@/components/moveis/orientacoes/OrientacoesList";

interface OrientacoesTabContentProps {
  onShowAddOrientacaoDialog: () => void;
}

export function OrientacoesTabContent({ onShowAddOrientacaoDialog }: OrientacoesTabContentProps) {
  return (
    <div className="bg-gradient-to-br from-background to-green-50/10 dark:to-green-950/20">
      <div className="p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass-card rounded-xl p-4 sm:p-6 border border-green-500/10 dark:border-green-400/20 shadow-soft"
        >
          <OrientacoesList onNovaOrientacao={onShowAddOrientacaoDialog} />
        </motion.div>
      </div>
    </div>
  );
}
