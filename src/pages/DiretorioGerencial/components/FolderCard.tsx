import { memo } from "react";
import { FolderOpen, MoreVertical, AlertCircle, Files } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PastaComCounts } from "../types";
import { getItemCountText } from "../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit3, Trash2, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FolderCardProps {
  pasta: PastaComCounts;
  onClick: () => void;
  onEdit?: (pasta: PastaComCounts) => void;
  onDelete?: (pasta: PastaComCounts) => void;
  onMove?: (pasta: PastaComCounts) => void;
  pendingAIFiles?: number;
}

export const FolderCard = memo(function FolderCard({
  pasta,
  onClick,
  onEdit,
  onDelete,
  onMove,
  pendingAIFiles = 0,
}: FolderCardProps) {
  const iconColor = pasta.cor || "#3b82f6";
  const itemCountText = getItemCountText(pasta.subfolders_count, pasta.files_count);
  const hasPendingFiles = pendingAIFiles > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group glass-card overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:border-primary/50",
        hasPendingFiles && "border-l-4 border-l-yellow-500"
      )}
      onClick={onClick}
    >
      <Card className="border-0 bg-transparent">
        <CardContent className="p-4 flex items-center space-x-3">
          <div
            className="p-3 rounded-lg flex-shrink-0 relative"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <FolderOpen className="w-8 h-8" style={{ color: iconColor }} />
            {hasPendingFiles && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-[8px] font-bold text-white">!</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm truncate" title={pasta.nome}>
                {pasta.nome}
              </h4>
              {hasPendingFiles && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 bg-yellow-500/10 text-yellow-600 border-yellow-500/50"
                >
                  {pendingAIFiles} pendente{pendingAIFiles > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">{itemCountText}</p>
            </div>
          </div>

          {(onEdit || onDelete || onMove) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onMove && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(pasta); }}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Mover
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(pasta); }}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Renomear
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(pasta); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
