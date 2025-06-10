
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Target, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface RotinaWithStatus {
  id: string;
  titulo: string;
  descricao?: string;
  status: "pendente" | "concluida" | "atrasada";
}

interface RotinaInfoProps {
  rotina: RotinaWithStatus;
  onViewRotina?: (rotinaId: string) => void;
}

export function RotinaInfo({ rotina, onViewRotina }: RotinaInfoProps) {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/20';
      case 'atrasada':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header da Rotina */}
      <div className={cn(
        "flex items-start justify-between gap-3",
        isMobile && "flex-col"
      )}>
        <div className="min-w-0 flex-1">
          <h4 className={cn(
            "font-semibold text-green-900 dark:text-green-200 line-clamp-2",
            isMobile ? "text-sm" : "text-base"
          )}>
            {rotina.titulo}
          </h4>
          {rotina.descricao && (
            <p className={cn(
              "text-green-700 dark:text-green-300 mt-1 line-clamp-2",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {rotina.descricao}
            </p>
          )}
        </div>
        
        <Badge className={cn(
          getStatusColor(rotina.status),
          isMobile ? "text-xs px-2 py-1" : "text-sm",
          "flex-shrink-0"
        )}>
          {rotina.status}
        </Badge>
      </div>

      {/* Informações Adicionais - Mobile em grid 2x2 */}
      <div className={cn(
        "grid gap-2",
        isMobile ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
      )}>
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Target className={cn("flex-shrink-0", isMobile ? "h-3 w-3" : "h-4 w-4")} />
          <span className={cn("truncate", isMobile ? "text-xs" : "text-sm")}>
            Rotina Vinculada
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Clock className={cn("flex-shrink-0", isMobile ? "h-3 w-3" : "h-4 w-4")} />
          <span className={cn("truncate", isMobile ? "text-xs" : "text-sm")}>
            Automática
          </span>
        </div>
      </div>

      {/* Botão de Ação */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onViewRotina?.(rotina.id)}
        className={cn(
          "w-full gap-2 text-green-700 border-green-300 hover:bg-green-50 dark:text-green-300 dark:border-green-600 dark:hover:bg-green-950/20",
          isMobile ? "h-8 text-xs" : "h-9 text-sm"
        )}
      >
        <ArrowRight className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
        Ver Rotina Completa
      </Button>
    </motion.div>
  );
}
