import { useState } from "react";
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
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

interface CreateChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  webhookUrl: string;
  isActive: boolean;
}

export function CreateChatbotDialog({ open, onOpenChange, onSuccess }: CreateChatbotDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      webhookUrl: "",
      isActive: true,
    },
  });

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
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Test connection",
          test: true,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
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

      // Create chatbot in database
      const { error } = await supabase
        .from('assistentes_chatbots')
        .insert({
          name: data.name,
          webhook_url: data.webhookUrl,
          is_active: data.isActive,
          created_by: user.id,
        });

      if (error) throw error;

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o assistente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] p-4 sm:p-6">
        <div className="w-full max-w-full overflow-hidden">
          <DialogHeader className="w-full max-w-full">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl break-words">
              <Bot className="h-5 w-5 flex-shrink-0" />
              Criar Novo Assistente
            </DialogTitle>
            <DialogDescription className="text-sm break-words">
              Configure um novo chatbot assistente de IA com webhook personalizado.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-full">
              <div className="w-full max-w-full overflow-hidden">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full max-w-full overflow-hidden">
                      <FormLabel className="text-sm">Nome do Assistente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Assistente de Vendas"
                          {...field}
                          disabled={loading}
                          className="text-sm w-full max-w-full min-w-0 box-border"
                        />
                      </FormControl>
                      <FormDescription className="text-xs break-words">
                        Nome que aparecerá para os usuários
                      </FormDescription>
                      <FormMessage className="text-xs break-words" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full max-w-full overflow-hidden">
                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem className="w-full max-w-full overflow-hidden">
                      <FormLabel className="text-sm">URL do Webhook</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.exemplo.com/webhook"
                          {...field}
                          disabled={loading}
                          className="text-sm w-full max-w-full min-w-0 box-border"
                          style={{ wordBreak: 'break-all' }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs break-words">
                        URL que receberá as mensagens dos usuários
                      </FormDescription>
                      <FormMessage className="text-xs break-words" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full max-w-full overflow-hidden">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-3 w-full max-w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <FormLabel className="text-sm">Assistente Ativo</FormLabel>
                          <FormDescription className="text-xs break-words">
                            O assistente estará disponível para interação
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                            className="ml-0 sm:ml-auto"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="w-full sm:w-auto text-sm"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Assistente
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}