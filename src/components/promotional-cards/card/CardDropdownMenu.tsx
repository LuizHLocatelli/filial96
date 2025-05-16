
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, FolderOpen, X, MoreHorizontal, Download, Pencil } from "lucide-react";
import { FolderItem } from "@/hooks/useFolders";
import { cn } from "@/lib/utils";

interface CardDropdownMenuProps {
  folderId: string | null;
  folders: FolderItem[];
  onView: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToFolder: (folderId: string | null) => void;
  isLoading: boolean;
  isMobile?: boolean;
}

export function CardDropdownMenu({
  folderId,
  folders,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onMoveToFolder,
  isLoading,
  isMobile,
}: CardDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(isMobile && "w-48")}>
        <DropdownMenuLabel className={cn(isMobile && "text-xs")}>Opções</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onView} className={cn(isMobile && "text-xs")}>
          Visualizar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownload} className={cn(isMobile && "text-xs")}>
          <Download className="mr-2 h-3.5 w-3.5" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className={cn(isMobile && "text-xs")}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuLabel className={cn(isMobile && "text-xs")}>Pastas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {folderId && (
          <DropdownMenuItem 
            onClick={() => onMoveToFolder(null)} 
            className={cn(isMobile && "text-xs")}
            disabled={isLoading}
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Remover da pasta
          </DropdownMenuItem>
        )}
        
        {folders.length > 0 && (
          folders
            .filter(folder => folder.id !== folderId)
            .map(folder => (
              <DropdownMenuItem 
                key={folder.id}
                onClick={() => onMoveToFolder(folder.id)}
                className={cn(isMobile && "text-xs")}
                disabled={isLoading}
              >
                <FolderOpen className="mr-2 h-3.5 w-3.5" />
                Mover para {folder.name}
              </DropdownMenuItem>
            ))
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className={cn("text-red-600", isMobile && "text-xs")}
          onClick={onDelete}
          disabled={isLoading}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
