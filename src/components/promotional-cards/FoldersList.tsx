import { useState, useEffect } from "react";
import { Folder, FolderPlus, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { EditFolderDialog } from "./EditFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";

interface FoldersListProps {
  sector: "furniture" | "fashion" | "loan" | "service";
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

interface FolderItem {
  id: string;
  name: string;
}

export function FoldersList({ sector, selectedFolderId, onSelectFolder }: FoldersListProps) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    refetch();
  }, [sector]);

  const refetch = async () => {
    try {
      const { data, error } = await supabase
        .from('card_folders')
        .select('id, name')
        .eq('sector', sector);

      if (error) {
        throw error;
      }

      setFolders(data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as pastas. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-2">
      {/* "Todos os Cards" item */}
      <div
        onClick={() => onSelectFolder(null)}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group border-2",
          selectedFolderId === null 
            ? "btn-primary-standard shadow-sm" 
            : "bg-background hover:bg-muted border-border hover:border-border/80 text-foreground"
        )}
      >
        <FolderPlus className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium text-sm">Todos os Cards</span>
      </div>

      {/* Folders list */}
      {folders.map((folder) => (
        <div key={folder.id} className="relative group">
          <div
            onClick={() => onSelectFolder(folder.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 pr-12",
              selectedFolderId === folder.id 
                ? "btn-primary-standard shadow-sm" 
                : "bg-background hover:bg-muted border-border hover:border-border/80 text-foreground"
            )}
          >
            <Folder className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium text-sm truncate">{folder.name}</span>
          </div>

          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-2 right-2 h-8 w-8 rounded-md p-0 transition-all duration-200",
                  "opacity-0 group-hover:opacity-100",
                  selectedFolderId === folder.id 
                    ? "hover:bg-primary-foreground/20 text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => {
                setSelectedFolder(folder);
                setIsEditDialogOpen(true);
              }}>
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Renomear</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setSelectedFolder(folder);
                setIsDeleteDialogOpen(true);
              }} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {/* Dialogs */}
      <EditFolderDialog
        folder={selectedFolder}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={refetch}
      />

      <DeleteFolderDialog
        folderId={selectedFolder?.id || null}
        folderName={selectedFolder?.name || ""}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
