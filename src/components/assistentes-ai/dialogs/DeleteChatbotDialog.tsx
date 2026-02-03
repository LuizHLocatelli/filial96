import { useState } from 'react';
import { AlertTriangle, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Chatbot } from '../types';
import { StandardDialogHeader, StandardDialogContent, StandardDialogFooter } from '@/components/ui/standard-dialog';

interface DeleteChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: Chatbot;
  onSuccess: () => void;
}

export function DeleteChatbotDialog({ open, onOpenChange, chatbot, onSuccess }: DeleteChatbotDialogProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[420px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Excluir Assistente"
          onClose={() => onOpenChange(false)}
          loading={loading}
        />

        <StandardDialogContent className="space-y-6">
          <div className={`flex items-center gap-3 ${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-muted/50`}>
            <div className={`${isMobile ? 'p-2' : 'p-3'} rounded-xl bg-primary/10 shrink-0`}>
              <Bot className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{chatbot.name}</p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                Criado em {new Date(chatbot.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <DialogDescription
            className={`
              ${isMobile ? 'text-sm' : 'text-base'}
              text-center leading-relaxed px-1
            `}
          >
            Tem certeza que deseja excluir este assistente? Esta ação não pode ser desfeita.
          </DialogDescription>
        </StandardDialogContent>

        <StandardDialogFooter
          className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}
        >
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className={isMobile ? 'w-full h-10' : 'flex-1'}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className={`${isMobile ? 'w-full h-10' : 'flex-1'} gap-2`}
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
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
