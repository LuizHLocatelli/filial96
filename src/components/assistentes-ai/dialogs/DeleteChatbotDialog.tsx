import { useState } from 'react';
import { AlertTriangle, Loader2, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Chatbot } from '../types';

interface DeleteChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: Chatbot;
  onSuccess: () => void;
}

export function DeleteChatbotDialog({ open, onOpenChange, chatbot, onSuccess }: DeleteChatbotDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('assistentes_chatbots')
        .delete()
        .eq('id', chatbot.id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Assistente excluído com sucesso.',
        className: 'bg-green-500/10 border-green-500/20 text-green-600',
      });

      onSuccess();
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o assistente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-500/5 p-6 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 rounded-xl bg-red-500/10">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                Excluir Assistente
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-background/50"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="p-3 rounded-xl bg-primary/10">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{chatbot.name}</p>
              <p className="text-sm text-muted-foreground">
                Criado em {new Date(chatbot.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <DialogDescription className="text-base text-center">
            Tem certeza que deseja excluir este assistente? Esta ação não pode ser desfeita.
          </DialogDescription>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
