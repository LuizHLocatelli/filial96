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
      <AlertDialogContent className="sm:max-w-[425px] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] p-4 sm:p-6 glass-card border-destructive/10">
        <div className="w-full max-w-full overflow-hidden">
          <AlertDialogHeader className="w-full max-w-full pb-4">
            <AlertDialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold break-words text-destructive">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm break-words mt-2">
              Tem certeza que deseja excluir o assistente <span className="font-bold text-foreground">"{chatbot?.name}"</span>?
              <br />
              <br />
              <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-destructive text-xs uppercase tracking-wider">Ação Irreversível</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li className="break-words">O assistente e suas configurações</li>
                  <li className="break-words">Todas as conversas relacionadas</li>
                  <li className="break-words">Todo o histórico de interações</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto glass-button-outline"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full sm:w-auto glass-button-destructive shadow-lg shadow-destructive/20"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Assistente
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}