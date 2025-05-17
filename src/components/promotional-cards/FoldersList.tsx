
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FoldersListProps {
  sector: "furniture" | "fashion" | "loan" | "service";
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FoldersList({ sector, selectedFolderId, onSelectFolder }: FoldersListProps) {
  const { folders, isLoading } = useFolders(sector);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<{id: string, name: string} | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = (folder: {id: string, name: string}) => {
    setSelectedFolder(folder);
    setNewFolderName(folder.name);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (folder: {id: string, name: string}) => {
    setSelectedFolder(folder);
    setIsDeleteDialogOpen(true);
  };

  const updateFolder = async () => {
    if (!selectedFolder) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('card_folders')
        .update({ name: newFolderName.trim() })
        .eq('id', selectedFolder.id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Pasta atualizada com sucesso"
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a pasta",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteFolder = async () => {
    if (!selectedFolder) return;
    
    setIsProcessing(true);
    try {
      // First update any cards in this folder to have no folder
      const { error: updateCardsError } = await supabase
        .from('promotional_cards')
        .update({ folder_id: null })
        .eq('folder_id', selectedFolder.id);
        
      if (updateCardsError) throw updateCardsError;
      
      // Then delete the folder
      const { error } = await supabase
        .from('card_folders')
        .delete()
        .eq('id', selectedFolder.id);
        
      if (error) throw error;
      
      // If we were viewing this folder, reset to all cards
      if (selectedFolderId === selectedFolder.id) {
        onSelectFolder(null);
      }
      
      toast({
        title: "Sucesso",
        description: "Pasta excluída com sucesso"
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pasta",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
                <span className="truncate">{folder.name}</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(folder)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(folder)}
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

      {/* Edit Folder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Pasta</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                Nome
              </Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={updateFolder} disabled={isProcessing || !newFolderName.trim()}>
              {isProcessing ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir a pasta "{selectedFolder?.name}"?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Os cards desta pasta não serão excluídos, apenas removidos da pasta.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteFolder} 
              disabled={isProcessing}
            >
              {isProcessing ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
