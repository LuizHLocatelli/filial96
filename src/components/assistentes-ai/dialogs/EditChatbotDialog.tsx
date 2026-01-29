import { useState } from 'react';
import { Bot, Loader2, Sparkles, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Chatbot } from '../types';

interface EditChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: Chatbot;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  webhookUrl: string;
  isActive: boolean;
  acceptImages: boolean;
}

export function EditChatbotDialog({ open, onOpenChange, chatbot, onSuccess }: EditChatbotDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: chatbot.name,
      webhookUrl: chatbot.webhook_url,
      isActive: chatbot.is_active,
      acceptImages: chatbot.accept_images,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('assistentes_chatbots')
        .update({
          name: data.name,
          webhook_url: data.webhookUrl,
          is_active: data.isActive,
          accept_images: data.acceptImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatbot.id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Assistente atualizado com sucesso.',
        className: 'bg-green-500/10 border-green-500/20 text-green-600',
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating chatbot:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o assistente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                Editar Assistente
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-background/50"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">Nome do Assistente</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ex: Consultor de Vendas"
                        {...field}
                        disabled={loading}
                        className="h-12 pl-11"
                      />
                      <Bot className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">Webhook URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="https://seu-endpoint.com/webhook"
                        {...field}
                        disabled={loading}
                        className="h-12 pl-11"
                      />
                      <Sparkles className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status Ativo</FormLabel>
                      <FormDescription>
                        Disponível para uso
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptImages"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Aceitar Imagens
                      </FormLabel>
                      <FormDescription>
                        Permite enviar imagens no chat
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
