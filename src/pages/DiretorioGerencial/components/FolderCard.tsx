import { Folder, FolderOpen, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PastaGerencial } from "../types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Edit3, Trash2, ArrowRightLeft } from "lucide-react";

interface FolderCardProps {
  pasta: PastaGerencial;
  onClick: () => void;
  onEdit?: (pasta: PastaGerencial) => void;
  onDelete?: (pasta: PastaGerencial) => void;
  onMove?: (pasta: PastaGerencial) => void;
}

export function FolderCard({ pasta, onClick, onEdit, onDelete, onMove }: FolderCardProps) {
  const getIconColor = () => {
    return pasta.cor || '#3b82f6';
  };

  return (
    <Card 
      className="group glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer relative"
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center space-x-3">
        <div 
          className="p-3 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${getIconColor()}20` }}
        >
          <FolderOpen 
            className="w-8 h-8" 
            style={{ color: getIconColor() }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate" title={pasta.nome}>
            {pasta.nome}
          </h4>
          <p className="text-xs text-muted-foreground">
            Pasta
          </p>
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
  );
}
