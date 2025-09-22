import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Chatbot {
  id: string;
  name: string;
}

interface DeleteChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: Chatbot | null;
  onSuccess: () => void;
}

export function DeleteChatbotDialog({ open, onOpenChange, chatbot, onSuccess }: DeleteChatbotDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!chatbot) return;
    
    setLoading(true);

    try {
      // Delete all conversations for this chatbot first
      await supabase
        .from('assistentes_conversas')
        .delete()
        .eq('chatbot_id', chatbot.id);

      // Delete the chatbot
      const { error } = await supabase
        .from('assistentes_chatbots')
        .delete()
        .eq('id', chatbot.id);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o assistente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o assistente "{chatbot?.name}"?
            <br />
            <br />
            <strong>Esta ação é irreversível</strong> e irá excluir:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>O assistente e suas configurações</li>
              <li>Todas as conversas relacionadas</li>
              <li>Todo o histórico de interações</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir Assistente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}