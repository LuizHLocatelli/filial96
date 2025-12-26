import { useState, useEffect } from "react";
import { Bot, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { cn } from "@/lib/utils";

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

  const onSubmit = async (data: FormData) => {
    if (!chatbot) return;
    
    setLoading(true);

    try {
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

      toast({
        title: "Sucesso!",
        description: "Assistente atualizado com sucesso.",
        className: "bg-green-500/10 border-green-500/20 text-green-500",
      });

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
      <DialogContent 
        className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-black/40 backdrop-blur-xl ring-1 ring-white/10"
        hideCloseButton
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <DialogHeader className="p-6 pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl font-light text-white">
              <span className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10">
                <Bot className="w-5 h-5 text-primary" />
              </span>
              Editar Assistente
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-white/50 text-sm font-light mt-2">
            Atualize as configurações do seu assistente.
          </p>
        </DialogHeader>

        <div className="p-6 pt-2 relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-white/80">Nome do Assistente</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            placeholder="Ex: Consultor de Vendas"
                            {...field}
                            disabled={loading}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-green-500/50 focus:ring-green-500/20 transition-all pl-10 h-12"
                          />
                          <Bot className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-green-400 transition-colors" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 font-light" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-white/80">Webhook URL</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            placeholder="https://seu-endpoint.com/webhook"
                            {...field}
                            disabled={loading}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-green-500/50 focus:ring-green-500/20 transition-all pl-10 h-12"
                          />
                          <Sparkles className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-green-400 transition-colors" />
                        </div>
                      </FormControl>
                      <FormDescription className="text-white/30 text-xs">
                        Endpoint para processamento das mensagens
                      </FormDescription>
                      <FormMessage className="text-red-400 font-light" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium text-white cursor-pointer">
                          Status Ativo
                        </FormLabel>
                        <FormDescription className="text-white/40 text-xs">
                          Disponível para uso imediato
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                          className="data-[state=checked]:bg-green-500"
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
                  className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className={cn(
                    "flex-1 bg-green-500 hover:bg-green-600 text-white border-0 transition-all duration-300",
                    loading && "opacity-80 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}