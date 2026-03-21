import { useState, useEffect, useCallback } from "react";
import { Folder, FolderPlus, MoreHorizontal, Trash2, Edit3, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
      const { data: foldersData, error: foldersError } = await supabase
        .from('card_folders')
        .select('id, name')
        .eq('sector', sector);

      if (foldersError) {
        throw foldersError;
      }

      const { data: countsData, error: countsError } = await supabase
        .from('promotional_cards')
        .select('folder_id', { count: 'exact' })
        .eq('sector', sector);

      if (countsError) {
        throw countsError;
      }

      const countMap = new Map<string, number>();
      let totalCount = 0;
      countsData?.forEach(card => {
        const folderId = card.folder_id || 'null';
        countMap.set(folderId, (countMap.get(folderId) || 0) + 1);
        totalCount++;
      });

      const foldersWithCounts = (foldersData || []).map(folder => ({
        ...folder,
        cardCount: countMap.get(folder.id) || 0
      }));

      setFolders(foldersWithCounts);
      setTotalCardCount(totalCount);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Erro ao carregar", { description: "Não foi possível carregar as pastas. Tente novamente." });
    }
  }, [sector]);

  useEffect(() => {
    refetch();
  }, [refetch, sector]);
  
  const FolderItem = ({ folder, index, isAllCards = false }: { folder?: FolderItem; index?: number; isAllCards?: boolean }) => {
    const isSelected = isAllCards ? selectedFolderId === null : selectedFolderId === folder?.id;
    const item = isAllCards 
      ? { id: null, name: 'Todos os Cards', cardCount: totalCardCount }
      : folder;

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index !== undefined ? index * 0.03 : 0 }}
      >
        <div
          onClick={() => onSelectFolder(item.id)}
          className={cn(
            "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
            "border-2",
            isSelected
              ? "bg-gradient-to-r from-primary/20 to-primary/10 border-primary shadow-sm"
              : cn(
                  "bg-card hover:bg-muted/50 border-transparent hover:border-border/50",
                  "hover:shadow-sm"
                )
          )}
        >
          <div className={cn(
            "flex items-center justify-center rounded-lg transition-all duration-200",
            "w-9 h-9 flex-shrink-0",
            isSelected 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted group-hover:bg-muted/80 text-muted-foreground"
          )}>
            {isAllCards ? (
              <Layers className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className={cn(
              "font-medium text-sm block truncate",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {item?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isSelected 
                ? "bg-primary/20 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {item?.cardCount || 0}
            </span>

            {!isAllCards && folder && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 rounded-md transition-all duration-200",
                      "opacity-0 group-hover:opacity-100",
                      isSelected 
                        ? "hover:bg-primary/20 text-primary" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
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
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-2">
      <FolderItem isAllCards />
      
      {folders.map((folder, index) => (
        <FolderItem key={folder.id} folder={folder} index={index + 1} />
      ))}

      {folders.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Nenhuma pasta ainda</p>
          <p className="text-[10px] mt-1">Crie uma pasta para organizar seus cards</p>
        </div>
      )}

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
