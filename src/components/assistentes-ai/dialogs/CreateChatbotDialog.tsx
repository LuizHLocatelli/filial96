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
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  webhookUrl: string;
  isActive: boolean;
  acceptImages: boolean;
}

export function CreateChatbotDialog({ open, onOpenChange, onSuccess }: CreateChatbotDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      webhookUrl: '',
      isActive: true,
      acceptImages: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('assistentes_chatbots')
        .insert({
          name: data.name,
          webhook_url: data.webhookUrl,
          is_active: data.isActive,
          accept_images: data.acceptImages,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Assistente criado com sucesso.',
        className: 'bg-green-500/10 border-green-500/20 text-green-600',
      });

      form.reset();
      setStep(1);
      onSuccess();
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o assistente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const name = form.getValues('name');
    if (name.trim()) {
      setStep(2);
    } else {
      form.setError('name', { message: 'Nome é obrigatório' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6 border-b">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                Novo Assistente
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
            
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
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
                        <FormDescription>
                          Escolha um nome descritivo para identificar seu assistente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="button" onClick={nextStep} className="gap-2">
                      Próximo
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
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
                        <FormDescription>
                          Endpoint que processará as mensagens do assistente
                        </FormDescription>
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
                              Disponível para uso imediato
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

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || !form.formState.dirtyFields.webhookUrl}
                      className="flex-1 gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Criar Assistente'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
