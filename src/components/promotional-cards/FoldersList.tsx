
import { Button } from "@/components/ui/button";
import { Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useFolders } from "@/hooks/useFolders";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface FoldersListProps {
  sector: "furniture" | "fashion";
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FoldersList({ sector, selectedFolderId, onSelectFolder }: FoldersListProps) {
  const { folders, isLoading } = useFolders(sector);
  const isMobile = useIsMobile();
  const [folderToEdit, setFolderToEdit] = useState<{ id: string, name: string } | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [editedFolderName, setEditedFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    setIsSubmitting(true);
    try {
      // Check if folder has cards
      const { data: cards, error: cardsError } = await supabase
        .from('promotional_cards')
        .select('id')
        .eq('folder_id', folderToDelete);
      
      if (cardsError) throw cardsError;
      
      if (cards && cards.length > 0) {
        // Update cards to remove folder association
        const { error: updateError } = await supabase
          .from('promotional_cards')
          .update({ folder_id: null })
          .eq('folder_id', folderToDelete);
        
        if (updateError) throw updateError;
      }
      
      // Delete the folder
      const { error: deleteError } = await supabase
        .from('card_folders')
        .delete()
        .eq('id', folderToDelete);
      
      if (deleteError) throw deleteError;
      
      // Reset selected folder if it was deleted
      if (selectedFolderId === folderToDelete) {
        onSelectFolder(null);
      }
      
      toast({
        title: "Sucesso",
        description: "Pasta excluída com sucesso"
      });
      
      setFolderToDelete(null);
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pasta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFolder = async () => {
    if (!folderToEdit || !editedFolderName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('card_folders')
        .update({ name: editedFolderName.trim() })
        .eq('id', folderToEdit.id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Nome da pasta atualizado com sucesso"
      });
      
      setFolderToEdit(null);
    } catch (error) {
      console.error('Error updating folder name:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome da pasta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="h-8 bg-muted rounded-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "default"}
          className={cn(
            "w-full justify-start text-left font-normal",
            selectedFolderId === null && "bg-accent text-accent-foreground",
            isMobile && "text-xs py-1.5 h-auto"
          )}
          onClick={() => onSelectFolder(null)}
        >
          <Folder className={cn("mr-2", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
          Todos os Cards
        </Button>
        
        {folders.map((folder) => (
          <div key={folder.id} className="flex items-center">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              className={cn(
                "flex-1 justify-start text-left font-normal",
                selectedFolderId === folder.id && "bg-accent text-accent-foreground",
                isMobile && "text-xs py-1.5 h-auto"
              )}
              onClick={() => onSelectFolder(folder.id)}
            >
              <Folder className={cn("mr-2", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
              <span className="truncate">{folder.name}</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("px-2", isMobile && "h-6")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn(isMobile && "w-48")}>
                <DropdownMenuItem 
                  className={cn(isMobile && "text-xs")}
                  onClick={() => {
                    setFolderToEdit(folder);
                    setEditedFolderName(folder.name);
                  }}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn("text-red-600", isMobile && "text-xs")}
                  onClick={() => setFolderToDelete(folder.id)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Dialog de edição de pasta */}
      <Dialog 
        open={folderToEdit !== null} 
        onOpenChange={(open) => !open && setFolderToEdit(null)}
      >
        <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Editar Pasta</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateFolder();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-xs sm:text-sm">Nome da pasta</Label>
              <Input
                id="folder-name"
                value={editedFolderName}
                onChange={(e) => setEditedFolderName(e.target.value)}
                placeholder="Digite o nome da pasta"
                disabled={isSubmitting}
                className="text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFolderToEdit(null)}
                disabled={isSubmitting}
                className="text-xs sm:text-sm h-8 sm:h-10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !editedFolderName.trim()}
                className="text-xs sm:text-sm h-8 sm:h-10"
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog 
        open={folderToDelete !== null} 
        onOpenChange={(open) => !open && setFolderToDelete(null)}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Excluir pasta?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Os cards desta pasta não serão excluídos, mas serão removidos da pasta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="text-xs sm:text-sm h-8 sm:h-10"
              disabled={isSubmitting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFolder} 
              className="text-xs sm:text-sm h-8 sm:h-10"
              disabled={isSubmitting}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
