import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Download, FileText, Image, File, Calendar, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Orientacao } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface OrientacaoCardProps {
  orientacao: Orientacao;
  onView: (orientacao: Orientacao) => void;
}

export function OrientacaoCard({ orientacao, onView }: OrientacaoCardProps) {
  const isMobile = useIsMobile();

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "vm":
        return (
          <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 dark:from-green-950/30 dark:to-green-950/20 dark:text-green-300 font-medium">
            VM
          </Badge>
        );
      case "informativo":
        return (
          <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 dark:from-blue-950/30 dark:to-blue-950/20 dark:text-blue-300 font-medium">
            Informativo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 dark:from-gray-950/30 dark:to-gray-950/20 dark:text-gray-300 font-medium">
            Outro
          </Badge>
        );
    }
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes("image")) return <Image className="h-4 w-4 text-blue-500" />;
    if (tipo.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(orientacao.arquivo_url, "_blank");
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="w-full"
    >
      <Card 
        className="group cursor-pointer transition-all duration-300 border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-primary/5 border border-border/50 hover:border-primary/20 overflow-hidden"
        onClick={() => onView(orientacao)}
      >
        {/* Header com título e badge */}
        <CardHeader className="pb-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} line-clamp-2 group-hover:text-primary transition-colors duration-300 font-semibold leading-tight`}>
              {orientacao.titulo}
            </CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getTipoBadge(orientacao.tipo)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {orientacao.descricao}
          </p>

          {/* File Info */}
          {orientacao.arquivo_url && (
            <motion.div 
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/50 group-hover:from-muted/50 group-hover:to-muted/70 transition-all duration-300 border border-border/30"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2 rounded-lg bg-background/80 border border-border/50 shadow-sm">
                {getFileIcon(orientacao.arquivo_tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Arquivo anexado
                </p>
                <p className="text-xs text-muted-foreground">
                  {orientacao.arquivo_tipo.split('/').pop()?.toUpperCase()}
                </p>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="space-y-2 flex-1">
              {orientacao.criado_por_nome && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {orientacao.criado_por_nome}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {format(new Date(orientacao.data_criacao), "PPP", { locale: ptBR })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(orientacao);
                  }}
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </motion.div>
              {orientacao.arquivo_url && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
