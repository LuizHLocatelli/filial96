
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Download, FileText, Image, File } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Orientacao } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

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
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300">
            VM
          </Badge>
        );
      case "informativo":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300">
            Informativo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-300">
            Outro
          </Badge>
        );
    }
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes("image")) return <Image className="h-4 w-4" />;
    if (tipo.includes("pdf")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(orientacao.arquivo_url, "_blank");
  };

  return (
    <Card 
      className="hover-lift cursor-pointer transition-all duration-300 border-0 shadow-soft hover:shadow-medium group"
      onClick={() => onView(orientacao)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} line-clamp-2 group-hover:text-primary transition-colors`}>
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
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
            <div className="p-1.5 rounded bg-primary/10">
              {getFileIcon(orientacao.arquivo_tipo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Arquivo anexado
              </p>
              <p className="text-xs text-muted-foreground">
                {orientacao.arquivo_tipo.split('/').pop()?.toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="space-y-1">
            {orientacao.criado_por_nome && (
              <p className="text-xs text-muted-foreground">
                Por: {orientacao.criado_por_nome}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(orientacao.data_criacao), "PPP", { locale: ptBR })}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(orientacao);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Eye className="h-4 w-4" />
              {!isMobile && <span className="ml-1">Ver</span>}
            </Button>
            {orientacao.arquivo_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Download className="h-4 w-4" />
                {!isMobile && <span className="ml-1">Baixar</span>}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
