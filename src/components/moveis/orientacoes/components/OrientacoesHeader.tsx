import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface OrientacoesHeaderProps {
  totalCount: number;
  vmCount: number;
  informativoCount: number;
  onNovaOrientacao?: () => void;
}

export function OrientacoesHeader({ totalCount, vmCount, informativoCount, onNovaOrientacao }: OrientacoesHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Orientações
              </h2>
              <p className="text-sm text-muted-foreground">
                Documentos e informativos para a equipe
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-background to-muted/50 border-border/60 text-foreground font-medium px-3 py-1.5 shadow-sm"
              >
                <TrendingUp className="h-3 w-3 mr-1.5" />
                Total: {totalCount}
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20 dark:from-primary/20 dark:to-primary/10 dark:text-primary dark:border-primary/30 font-medium px-3 py-1.5 shadow-sm"
              >
                VM: {vmCount}
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-accent/50 to-accent/30 text-accent-foreground border-accent/40 dark:from-accent/30 dark:to-accent/20 dark:text-accent-foreground dark:border-accent/50 font-medium px-3 py-1.5 shadow-sm"
              >
                Informativo: {informativoCount}
              </Badge>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <Button 
            onClick={onNovaOrientacao}
            className={`${isMobile ? 'flex-1' : ''} btn-primary-standard`}
        variant="success"
            size="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Nova" : "Nova Orientação"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
