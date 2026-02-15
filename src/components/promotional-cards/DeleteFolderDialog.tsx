import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[420px] p-0'}
          max-h-[85vh] overflow-y-auto flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Confirmar Exclusão"
          onClose={() => onOpenChange(false)}
          loading={isDeleting}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className={`flex items-center gap-3 ${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-muted/50`}>
            <div className="text-2xl">📁</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{folderName}</p>
              <p className="text-sm text-muted-foreground">Pasta selecionada</p>
            </div>
          </div>

          <DialogDescription className="text-center leading-relaxed px-1">
            Tem certeza que deseja excluir a pasta <strong>"{folderName}"</strong>?
            <br />
            <span className="text-red-600 font-medium text-sm">
              Esta ação não pode ser desfeita e todos os cards dentro dela serão removidos.
            </span>
          </DialogDescription>
        </div>
        
        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isDeleting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteFolder} 
            disabled={isDeleting}
            variant="destructive"
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir Pasta
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
