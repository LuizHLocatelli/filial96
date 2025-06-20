import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface CardDeleteDialogProps {
  cardId: string;
  cardTitle: string;
  onSuccess?: () => void;
}

export function CardDeleteDialog({ cardId, cardTitle, onSuccess }: CardDeleteDialogProps) {
  const { getMobileAlertDialogProps, getMobileButtonProps } = useMobileDialog();
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="hover:bg-red-100 hover:text-red-700 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent {...getMobileAlertDialogProps("medium")}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Tem certeza que deseja excluir o card <strong>"{cardTitle}"</strong>?
            <br />
            <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel {...getMobileButtonProps()} className="rounded-lg">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            {...getMobileButtonProps()}
            className="bg-red-600 hover:bg-red-700 rounded-lg"
          >
            {isDeleting ? "Excluindo..." : "Excluir Card"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
