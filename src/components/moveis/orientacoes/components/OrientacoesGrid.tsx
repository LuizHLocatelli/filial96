
import { OrientacaoCard } from "./OrientacaoCard";
import { Orientacao } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface OrientacoesGridProps {
  orientacoes: Orientacao[];
  viewMode: "grid" | "list";
  onViewOrientacao: (orientacao: Orientacao) => void;
  onUpdate?: () => void;
}

export function OrientacoesGrid({ orientacoes, viewMode, onViewOrientacao, onUpdate }: OrientacoesGridProps) {
  const isMobile = useIsMobile();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid gap-4 w-full ${
        viewMode === "grid" 
          ? (isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')
          : 'grid-cols-1'
      }`}
    >
      {orientacoes.map((orientacao) => (
        <motion.div
          key={orientacao.id}
          variants={itemVariants}
          className="w-full"
        >
          <OrientacaoCard 
            orientacao={orientacao} 
            onView={onViewOrientacao}
            onUpdate={onUpdate}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
