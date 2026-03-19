import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArquivoGerencial } from "../types";
import { getFileIcon, formatBytes } from "../lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, ArrowRightLeft } from "lucide-react";

interface FileCardProps {
  arquivo: ArquivoGerencial;
  onClick: () => void;
  onDelete?: (arquivo: ArquivoGerencial) => void;
  onMove?: (arquivo: ArquivoGerencial) => void;
}

export const FileCard = memo(function FileCard({
  arquivo,
  onClick,
  onDelete,
  onMove,
}: FileCardProps) {
  const { icon: FileIcon, color, label } = getFileIcon(arquivo.tipo_arquivo);
  const publicUrl = supabase.storage
    .from("diretorio_gerencial")
    .getPublicUrl(arquivo.caminho_storage).data.publicUrl;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = publicUrl;
    a.download = arquivo.nome_arquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card
      className="group glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="p-2 bg-background/50 rounded-lg">
          <FileIcon className="w-8 h-8" style={{ color }} />
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onMove && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(arquivo); }}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Mover
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(arquivo); }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        <h4 className="font-medium text-sm line-clamp-2 mb-1" title={arquivo.nome_arquivo}>
          {arquivo.nome_arquivo}
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          {formatBytes(arquivo.tamanho_bytes)} •{" "}
          {formatDistanceToNow(new Date(arquivo.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>

        {arquivo.resumo_ia && (
          <div className="bg-primary/5 rounded p-2 mb-3">
            <div className="flex items-center space-x-1 mb-1 text-primary">
              <Bot className="w-3 h-3" />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                Resumo IA
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {arquivo.resumo_ia}
            </p>
          </div>
        )}
      </CardContent>

      {arquivo.tags && arquivo.tags.length > 0 && (
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-1">
          {arquivo.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {tag}
            </Badge>
          ))}
          {arquivo.tags.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              +{arquivo.tags.length - 3}
            </Badge>
          )}
        </CardFooter>
      )}
    </Card>
  );
});
