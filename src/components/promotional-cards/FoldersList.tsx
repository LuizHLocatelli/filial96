import { useState, useEffect, useCallback } from "react";
import { Folder, FolderPlus, MoreHorizontal, Trash2, Edit3, Package } from "lucide-react";
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
  cardCount?: number;
}

export function FoldersList({ sector, selectedFolderId, onSelectFolder }: FoldersListProps) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [totalCardCount, setTotalCardCount] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const refetch = useCallback(async () => {
    try {
      // Buscar pastas
      const { data: foldersData, error: foldersError } = await supabase
        .from('card_folders')
        .select('id, name')
        .eq('sector', sector);

      if (foldersError) {
        throw foldersError;
      }

      // Buscar contagem de cards por pasta
      const { data: countsData, error: countsError } = await supabase
        .from('promotional_cards')
        .select('folder_id', { count: 'exact' })
        .eq('sector', sector);

      if (countsError) {
        throw countsError;
      }

      // Calcular contagem por pasta
      const countMap = new Map<string, number>();
      let totalCount = 0;
      countsData?.forEach(card => {
        const folderId = card.folder_id || 'null';
        countMap.set(folderId, (countMap.get(folderId) || 0) + 1);
        totalCount++;
      });

      // Adicionar contagem às pastas
      const foldersWithCounts = (foldersData || []).map(folder => ({
        ...folder,
        cardCount: countMap.get(folder.id) || 0
      }));

      setFolders(foldersWithCounts);
      setTotalCardCount(totalCount);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as pastas. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [sector]);

  useEffect(() => {
    refetch();
  }, [refetch, sector]);
  
  return (
    <div className="space-y-2">
      {/* "Todos os Cards" item */}
      <div
        onClick={() => onSelectFolder(null)}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 group border-2",
          selectedFolderId === null 
            ? "btn-primary-standard shadow-sm" 
            : "bg-background hover:bg-muted border-border hover:border-border/80 text-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          <FolderPlus className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm">Todos os Cards</span>
        </div>
        {totalCardCount > 0 && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            selectedFolderId === null 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {totalCardCount}
          </span>
        )}
      </div>

      {/* Folders list */}
      {folders.map((folder) => (
        <div key={folder.id} className="relative group">
          <div
            onClick={() => onSelectFolder(folder.id)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 pr-12",
              selectedFolderId === folder.id 
                ? "btn-primary-standard shadow-sm" 
                : "bg-background hover:bg-muted border-border hover:border-border/80 text-foreground"
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Folder className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm truncate">{folder.name}</span>
            </div>
            {(folder.cardCount || 0) > 0 && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                selectedFolderId === folder.id 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {folder.cardCount}
              </span>
            )}
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
