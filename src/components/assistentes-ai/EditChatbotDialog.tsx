import { useState, useEffect } from "react";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Chatbot {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
}

interface EditChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: Chatbot | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  webhookUrl: string;
  isActive: boolean;
}

export function EditChatbotDialog({ open, onOpenChange, chatbot, onSuccess }: EditChatbotDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      webhookUrl: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (chatbot) {
      form.reset({
        name: chatbot.name,
        webhookUrl: chatbot.webhook_url,
        isActive: chatbot.is_active,
      });
    }
  }, [chatbot, form]);

  const validateWebhookUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const testWebhookConnection = async (url: string): Promise<boolean> => {
    try {
      // Tenta primeiro com GET (muitos webhooks só aceitam GET para teste)
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (getResponse.ok) {
        return true;
      }
      
      // Se GET falhar, tenta com POST
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Test connection",
          test: true,
        }),
      });
      
      return postResponse.ok;
    } catch {
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!chatbot) return;
    
    setLoading(true);

    try {
      // Validate webhook URL
      if (!validateWebhookUrl(data.webhookUrl)) {
        toast({
          title: "URL inválida",
          description: "Por favor, insira uma URL válida (http:// ou https://)",
          variant: "destructive",
        });
        return;
      }

      // Test webhook connection (optional)
      const isConnectable = await testWebhookConnection(data.webhookUrl);
      if (!isConnectable) {
        toast({
          title: "Aviso",
          description: "Não foi possível conectar ao webhook. Verifique se a URL está correta.",
          variant: "destructive",
        });
        return;
      }

      // Update chatbot in database
      const { error } = await supabase
        .from('assistentes_chatbots')
        .update({
          name: data.name,
          webhook_url: data.webhookUrl,
          is_active: data.isActive,
        })
        .eq('id', chatbot.id);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error updating chatbot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o assistente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Editar Assistente
          </DialogTitle>
          <DialogDescription>
            Atualize as configurações do chatbot assistente.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Assistente</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Assistente de Vendas" 
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome que aparecerá para os usuários
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Webhook</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://api.exemplo.com/webhook" 
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    URL que receberá as mensagens dos usuários
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Assistente Ativo</FormLabel>
                    <FormDescription>
                      O assistente estará disponível para interação
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}