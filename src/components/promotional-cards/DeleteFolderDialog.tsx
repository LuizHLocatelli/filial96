import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Folder } from "./EditFolderDialog"; // Reutilizar a interface Folder

interface DeleteFolderDialogProps {
  folder: Folder | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void; // Callback para quando a exclusão for bem-sucedida
}

export function DeleteFolderDialog({ folder, isOpen, onOpenChange, onSuccess }: DeleteFolderDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteFolder = async () => {
    if (!folder) return;

    setIsProcessing(true);
    try {
      // Primeiro, atualiza os cards promocionais para remover a referência à pasta
      const { error: updateCardsError } = await supabase
        .from('promotional_cards')
        .update({ folder_id: null })
        .eq('folder_id', folder.id);

      if (updateCardsError) {
        console.error('Error updating cards before folder deletion:', updateCardsError);
        throw new Error(`Failed to update cards: ${updateCardsError.message}`);
      }

      // Depois, exclui a pasta
      const { error: deleteFolderError } = await supabase
        .from('card_folders')
        .delete()
        .eq('id', folder.id);

      if (deleteFolderError) {
        console.error('Error deleting folder:', deleteFolderError);
        throw new Error(`Failed to delete folder: ${deleteFolderError.message}`);
      }

      toast({
        title: "Sucesso!",
        description: "Pasta excluída com sucesso."
      });
      
      onOpenChange(false); // Fecha o diálogo
      if (onSuccess) {
        onSuccess(); // Chama o callback de sucesso
      }
    } catch (error) {
      console.error('Detailed error during folder deletion process:', error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      toast({
        title: "Erro ao Excluir",
        description: `Não foi possível excluir a pasta. Detalhes: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!folder) {
    return null; // Não renderiza nada se não houver pasta selecionada
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Esta ação irá excluir permanentemente a pasta selecionada
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Tem certeza que deseja excluir a pasta "<strong>{folder.name}</strong>"?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Os cards desta pasta não serão excluídos, apenas desassociados dela.
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteFolder} 
            disabled={isProcessing}
          >
            {isProcessing ? "Excluindo..." : "Excluir Pasta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 