import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Folder, Home, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useFolders } from "@/hooks/useFolders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { EditFolderDialog, Folder as FolderType } from "./EditFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";

interface FoldersListProps {
  sector: "furniture" | "fashion" | "loan" | "service";
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FoldersList({ sector, selectedFolderId, onSelectFolder }: FoldersListProps) {
  const { folders, isLoading, mutateFolders } = useFolders(sector) as any;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [folderForEdit, setFolderForEdit] = useState<FolderType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [folderForDelete, setFolderForDelete] = useState<FolderType | null>(null);

  const handleOpenEditDialog = (folder: FolderType) => {
    setFolderForEdit(folder);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (folder: FolderType) => {
    setFolderForDelete(folder);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-1">
          <Button 
            variant={selectedFolderId === null ? "secondary" : "ghost"} 
            size="sm"
            className={cn("w-full justify-start text-sm", 
              selectedFolderId === null ? "bg-secondary" : "hover:bg-secondary/50")}
            onClick={() => onSelectFolder(null)}
          >
            <Home className="mr-2 h-4 w-4" />
            Todos os Cards
          </Button>
          
          {folders.map(folder => (
            <div key={folder.id} className="flex items-center">
              <Button 
                variant={selectedFolderId === folder.id ? "secondary" : "ghost"} 
                size="sm"
                className={cn("w-full justify-start text-sm", 
                  selectedFolderId === folder.id ? "bg-secondary" : "hover:bg-secondary/50")}
                onClick={() => onSelectFolder(folder.id)}
              >
                <Folder className="mr-2 h-4 w-4" />
                <span className="truncate">{(folder as FolderType).name}</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenEditDialog(folder as FolderType)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleOpenDeleteDialog(folder as FolderType)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          
          {folders.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma pasta encontrada
            </div>
          )}
        </div>
      </ScrollArea>

      <EditFolderDialog 
        folder={folderForEdit}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          setFolderForEdit(null);
          if (typeof mutateFolders === 'function') {
            mutateFolders();
          }
        }}
      />

      <DeleteFolderDialog
        folder={folderForDelete}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={() => {
          setIsDeleteDialogOpen(false);
          if (selectedFolderId === folderForDelete?.id) {
            onSelectFolder(null);
          }
          setFolderForDelete(null);
          if (typeof mutateFolders === 'function') {
            mutateFolders();
          }
        }}
      />
    </>
  );
}
