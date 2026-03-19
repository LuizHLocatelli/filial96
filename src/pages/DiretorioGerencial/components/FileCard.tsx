import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Download, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArquivoGerencial } from "../types";
import { getFileIcon, formatBytes, getAIStatus } from "../lib/utils";
import { AI_STATUS_CONFIG } from "../constants";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, ArrowRightLeft, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FileCardProps {
  arquivo: ArquivoGerencial;
  onClick: () => void;
  onDelete?: (arquivo: ArquivoGerencial) => void;
  onMove?: (arquivo: ArquivoGerencial) => void;
  onRegenerate?: (arquivo: ArquivoGerencial) => void;
}

export const FileCard = memo(function FileCard({
  arquivo,
  onClick,
  onDelete,
  onMove,
  onRegenerate,
}: FileCardProps) {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const { icon: FileIcon, color, label } = getFileIcon(arquivo.tipo_arquivo);
  const aiStatus = getAIStatus(arquivo);
  const statusConfig = AI_STATUS_CONFIG[aiStatus];
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

  const borderColorClass = {
    unsupported: "border-l-muted-foreground/30",
    pending: "border-l-yellow-500",
    analyzing: "border-l-blue-500",
    completed: "border-l-green-500",
    error: "border-l-red-500",
  }[aiStatus];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group glass-card overflow-hidden cursor-pointer flex flex-col h-full",
        "border-l-4 transition-all duration-300",
        borderColorClass,
        aiStatus === "analyzing" && "animate-glow-pulse",
        "hover:shadow-lg hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <Card className="border-0 bg-transparent h-full flex flex-col">
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-background/50 rounded-lg relative">
              <FileIcon className="w-8 h-8" style={{ color }} />
              {aiStatus === "analyzing" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse-ring" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  statusConfig.bgColor,
                  statusConfig.color
                )}
              >
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                {aiStatus !== "unsupported" && onRegenerate && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRegenerate(arquivo); }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerar IA
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

        <CardContent className="p-4 pt-2 flex-grow flex flex-col">
          <h4 className="font-semibold text-sm line-clamp-2 mb-1" title={arquivo.nome_arquivo}>
            {arquivo.nome_arquivo}
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            {formatBytes(arquivo.tamanho_bytes)} •{" "}
            {formatDistanceToNow(new Date(arquivo.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>

          <AnimatePresence>
            {arquivo.resumo_ia && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSummaryExpanded(!isSummaryExpanded);
                  }}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-2 text-left"
                >
                  <div className="flex items-center gap-1.5 text-primary">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      Resumo IA
                    </span>
                  </div>
                  {isSummaryExpanded ? (
                    <ChevronUp className="w-3 h-3 text-primary" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-primary" />
                  )}
                </button>
                <p
                  className={cn(
                    "text-xs text-muted-foreground mt-2 leading-relaxed",
                    !isSummaryExpanded && "line-clamp-2"
                  )}
                >
                  {arquivo.resumo_ia}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {(!arquivo.resumo_ia && aiStatus === "pending") && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-4">
                <Bot className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Aguardando análise</p>
              </div>
            </div>
          )}
        </CardContent>

        {arquivo.tags && arquivo.tags.length > 0 && (
          <CardFooter className="p-4 pt-0 flex flex-wrap gap-1.5">
            {arquivo.tags.slice(0, 3).map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] px-2 py-0.5 h-5 bg-primary/10 text-primary border-0"
              >
                {tag}
              </Badge>
            ))}
            {arquivo.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-2 py-0.5 h-5 bg-muted text-muted-foreground"
              >
                +{arquivo.tags.length - 3}
              </Badge>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
});
