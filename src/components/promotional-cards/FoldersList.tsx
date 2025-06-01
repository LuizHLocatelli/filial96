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
      <ScrollArea className="h-[240px] pr-2">
        <div className="space-y-1.5">
          <button
            onClick={() => onSelectFolder(null)}
            className={cn(
              "group relative flex items-center gap-2.5 w-full p-2.5 rounded-lg transition-all duration-200 border text-left animate-fade-in-up",
              selectedFolderId === null
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card hover:bg-accent/80 border-border/50 hover:border-border hover:shadow-sm"
            )}
          >
            <div className={cn(
              "flex items-center justify-center rounded-md transition-all duration-200 w-6 h-6",
              selectedFolderId === null
                ? "bg-primary-foreground/20"
                : "group-hover:bg-accent"
            )}>
              <Home className={cn(
                "h-3.5 w-3.5 transition-all duration-200",
                selectedFolderId === null 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground group-hover:text-foreground"
              )} />
            </div>
            <span className={cn(
              "font-medium transition-all duration-200 text-xs flex-1",
              selectedFolderId === null 
                ? "text-primary-foreground" 
                : "text-muted-foreground group-hover:text-foreground"
            )}>
              Todos os Cards
            </span>
            
            {selectedFolderId === null && (
              <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
            )}
          </button>
          
          {folders.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-1" style={{ 
              animationDelay: `${(index + 1) * 30}ms`,
              animationFillMode: 'both'
            }}>
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  "group relative flex items-center gap-2.5 flex-1 p-2.5 rounded-lg transition-all duration-200 border text-left animate-fade-in-up",
                  selectedFolderId === folder.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card hover:bg-accent/80 border-border/50 hover:border-border hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center rounded-md transition-all duration-200 w-6 h-6",
                  selectedFolderId === folder.id
                    ? "bg-primary-foreground/20"
                    : "group-hover:bg-accent"
                )}>
                  <Folder className={cn(
                    "h-3.5 w-3.5 transition-all duration-200",
                    selectedFolderId === folder.id 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )} />
                </div>
                <span className={cn(
                  "font-medium transition-all duration-200 text-xs flex-1 truncate",
                  selectedFolderId === folder.id 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {(folder as FolderType).name}
                </span>
                
                {selectedFolderId === folder.id && (
                  <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                )}
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-md hover:bg-accent border border-border/30 hover:border-border transition-all duration-200 opacity-70 hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem 
                    onClick={() => handleOpenEditDialog(folder as FolderType)}
                    className="text-xs py-1.5"
                  >
                    <Pencil className="mr-2 h-3 w-3" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleOpenDeleteDialog(folder as FolderType)}
                    className="text-destructive focus:text-destructive text-xs py-1.5"
                  >
                    <Trash2 className="mr-2 h-3 w-3" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          
          {folders.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground bg-accent/20 rounded-lg border border-dashed border-border animate-fade-in-up">
              <Folder className="h-6 w-6 mx-auto mb-2 opacity-40" />
              <p className="font-medium">Nenhuma pasta encontrada</p>
              <p className="text-[10px] mt-0.5 opacity-60">Crie uma nova pasta</p>
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
