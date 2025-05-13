
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FolderIcon, 
  Loader2, 
  MoreHorizontal, 
  Pencil, 
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Folder {
  id: string;
  name: string;
  sector: "furniture" | "fashion";
}

interface FoldersListProps {
  sector: "furniture" | "fashion";
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FoldersList({ sector, selectedFolderId, onSelectFolder }: FoldersListProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tradução dos setores para português
  const sectorTranslation = {
    furniture: "Móveis",
    fashion: "Moda"
  };

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('card_folders')
        .select('*')
        .eq('sector', sector)
        .order('name');
      
      if (error) throw error;
      
      setFolders(data as Folder[]);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as pastas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    
    // Setup real-time subscription for folder updates
    const channel = supabase
      .channel('card-folders-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'card_folders',
        filter: `sector=eq.${sector}`
      }, () => {
        fetchFolders();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sector]);

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    setIsSubmitting(true);
    try {
      // Update cards in this folder to have null folder_id
      const { error: updateError } = await supabase
        .from('promotional_cards')
        .update({ folder_id: null })
        .eq('folder_id', folderToDelete);
      
      if (updateError) throw updateError;
      
      // Delete the folder
      const { error: deleteError } = await supabase
        .from('card_folders')
        .delete()
        .eq('id', folderToDelete);
      
      if (deleteError) throw deleteError;
      
      // If the deleted folder was selected, reset selection
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

  const handleEditFolder = async () => {
    if (!folderToEdit || !editedName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('card_folders')
        .update({ name: editedName.trim() })
        .eq('id', folderToEdit.id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Nome da pasta atualizado com sucesso"
      });
      
      setFolderToEdit(null);
    } catch (error) {
      console.error('Error updating folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome da pasta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Nenhuma pasta criada para {sectorTranslation[sector]}.
          </div>
        ) : (
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-normal",
                selectedFolderId === null && "bg-accent text-accent-foreground"
              )}
              onClick={() => onSelectFolder(null)}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              Todos os Cards
            </Button>
            
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    selectedFolderId === folder.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <FolderIcon className="h-4 w-4 mr-2" />
                  {folder.name}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setFolderToEdit(folder);
                      setEditedName(folder.name);
                    }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => setFolderToDelete(folder.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pasta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não excluirá os cards dentro da pasta, apenas a pasta em si.
              Os cards ficarão sem pasta após essa operação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFolder}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de edição de pasta */}
      <Dialog open={!!folderToEdit} onOpenChange={(open) => !open && setFolderToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pasta</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditFolder();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nome da Pasta</Label>
              <Input
                id="folder-name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Digite o novo nome da pasta"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFolderToEdit(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !editedName.trim()}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
