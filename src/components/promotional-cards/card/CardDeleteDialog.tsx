import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface CardDeleteDialogProps {
  cardId: string;
  cardTitle: string;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDeleteDialog({ cardId, cardTitle, onSuccess, open, onOpenChange }: CardDeleteDialogProps) {
  const isMobile = useIsMobile();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('promotional_cards')
        .delete()
        .eq('id', cardId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Card excluído com sucesso"
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o card",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Confirmar Exclusão"
          description={
            <>
              Tem certeza que deseja excluir o card <strong>"{cardTitle}"</strong>?
              <br />
              <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
            </>
          }
          onClose={() => onOpenChange(false)}
          loading={isDeleting}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">
              O card será permanentemente removido do sistema.
            </p>
          </div>
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
            onClick={handleDelete}
            disabled={isDeleting}
            className={`bg-red-600 hover:bg-red-700 ${isMobile ? 'w-full h-10' : ''}`}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Excluindo..." : "Excluir Card"}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
