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
                className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 dark:from-green-950/30 dark:to-green-950/20 dark:text-green-300 font-medium px-3 py-1.5 shadow-sm"
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
                className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 dark:from-blue-950/30 dark:to-blue-950/20 dark:text-blue-300 font-medium px-3 py-1.5 shadow-sm"
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
            className={`${isMobile ? 'flex-1' : ''} bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 btn-hover-scale`}
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
