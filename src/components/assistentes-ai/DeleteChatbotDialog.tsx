import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

      toast({
        title: "Sucesso!",
        description: "Assistente excluído com sucesso.",
        className: "bg-green-500/10 border-green-500/20 text-green-500",
      });

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
      <AlertDialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-black/40 backdrop-blur-xl ring-1 ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
        
        <AlertDialogHeader className="p-6 pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="flex items-center gap-2 text-2xl font-light text-white">
              <span className="p-2 rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </span>
              Excluir Assistente
            </AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </AlertDialogHeader>

        <div className="p-6 relative z-10 space-y-6">
          <div className="space-y-4">
            <p className="text-white/70 text-sm leading-relaxed">
              Tem certeza que deseja excluir o assistente <span className="font-semibold text-white">"{chatbot?.name}"</span>?
            </p>
            
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
              <p className="font-medium text-red-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Ação Irreversível
              </p>
              <ul className="space-y-2">
                {[
                  "O assistente e suas configurações serão perdidos",
                  "Todas as conversas serão apagadas",
                  "O histórico de interações será removido"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-red-200/60">
                    <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className={cn(
                "flex-1 bg-red-500 hover:bg-red-600 text-white border-0 transition-all duration-300 shadow-lg shadow-red-500/20",
                loading && "opacity-80 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Sim, Excluir"
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}