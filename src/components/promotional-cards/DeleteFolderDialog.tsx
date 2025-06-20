import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, AlertTriangle } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface DeleteFolderDialogProps {
  folderId: string | null;
  folderName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteFolderDialog({ 
  folderId, 
  folderName, 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: DeleteFolderDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteFolder = async () => {
    if (!folderId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('card_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pasta excluída com sucesso."
      });
      
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a pasta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("small")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-sm">
            Tem certeza que deseja excluir a pasta <strong>"{folderName}"</strong>?
            <br />
            <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita e todos os cards dentro dela serão removidos.</span>
          </DialogDescription>
        </DialogHeader>
        
        <div {...getMobileFooterProps()}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isDeleting}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteFolder} 
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Excluindo..." : "Excluir Pasta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 