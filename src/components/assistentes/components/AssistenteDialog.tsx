import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Save, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGenerateSystemMessage } from "../hooks/useGenerateSystemMessage";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { AIAssistant } from "../types";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(50),
  description: z.string().max(200).optional(),
  system_message: z.string().min(10, "Instruções devem ser detalhadas").max(8000),
  avatar_icon: z.string().max(2).optional(),
});

type FormData = z.infer<typeof schema>;

interface AssistenteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AIAssistant;
  onSave: (data: Omit<AIAssistant, "id" | "created_at" | "updated_at" | "user_id">) => void;
  onDelete?: (id: string) => void;
  isSaving?: boolean;
}

export function AssistenteDialog({ open, onOpenChange, initialData, onSave, onDelete, isSaving }: AssistenteDialogProps) {
  const [promptPurpose, setPromptPurpose] = useState("");
  const [highlightField, setHighlightField] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { generate, isGenerating } = useGenerateSystemMessage();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      system_message: "",
      avatar_icon: "🤖",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description || "",
          system_message: initialData.system_message,
          avatar_icon: initialData.avatar_icon || "🤖",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          system_message: "Você é um assistente prestativo e especializado em responder dúvidas com clareza e precisão.",
          avatar_icon: "🤖",
        });
      }
      setPromptPurpose("");
      setHighlightField(false);
    }
  }, [open, initialData, form]);

  const onSubmit = (data: FormData) => {
    onSave({
      name: data.name,
      description: data.description || "",
      system_message: data.system_message,
      avatar_icon: data.avatar_icon || "🤖",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleGeneratePrompt = async () => {
    if (!promptPurpose.trim()) {
      toast.warning("Por favor, descreva o propósito antes de gerar.");
      return;
    }
    const name = form.getValues("name");
    const description = form.getValues("description") || "";
    
    const result = await generate(promptPurpose, name, description);
    
    if (result && result.system_message) {
      // Small delay to ensure state updates visually if changing the fields multiple times
      form.setValue("system_message", result.system_message, { shouldValidate: true, shouldDirty: true });
      if (result.suggested_emoji && result.suggested_emoji.length <= 2) {
         form.setValue("avatar_icon", result.suggested_emoji, { shouldValidate: true, shouldDirty: true });
      }
      
      // Trigger the flash effect
      setHighlightField(true);
      setTimeout(() => setHighlightField(false), 2000);
      
      toast.success("Instruções e ícone gerados com sucesso!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col p-0" hideCloseButton>
        <StandardDialogHeader 
          icon={Bot} 
          title={initialData ? "Editar Assistente" : "Novo Assistente"} 
          onClose={handleClose} 
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/10">
          <Form {...form}>
            <form id="assistant-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex gap-4 items-start">
                <FormField
                  control={form.control}
                  name="avatar_icon"
                  render={({ field }) => (
                    <FormItem className="w-20 shrink-0 relative">
                      <FormLabel>Ícone</FormLabel>
                      <FormControl>
                        <motion.div
                          animate={{
                            boxShadow: highlightField ? "0 0 0 2px hsl(var(--primary)), 0 0 15px hsl(var(--primary)/0.3)" : "0 0 0 0px hsl(var(--primary))",
                            borderColor: highlightField ? "hsl(var(--primary))" : "inherit"
                          }}
                          transition={{ duration: 0.3 }}
                          className="rounded-md"
                        >
                          <Input {...field} className="text-center text-2xl h-10 transition-colors" placeholder="🤖" maxLength={2} />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Nome do Assistente *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Especialista Financeiro" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breve Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Uma frase explicando o propósito" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Sparkles className="w-4 h-4" />
                  <h3>Gerar Instruções com IA</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Descreva como você quer que o assistente se comporte e deixe a IA criar as instruções detalhadas e sugerir um ícone.
                </p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: Quero um assistente especialista em vendas que seja muito simpático e feche vendas de móveis..." 
                    value={promptPurpose}
                    onChange={(e) => setPromptPurpose(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGeneratePrompt();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="default"
                    className="shrink-0 transition-all duration-300" 
                    onClick={handleGeneratePrompt}
                    disabled={isGenerating || !promptPurpose.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="system_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções do Sistema (Cérebro do IA) *</FormLabel>
                    <FormControl>
                      <motion.div
                        animate={{
                          boxShadow: highlightField ? "0 0 0 2px hsl(var(--primary)), 0 0 15px hsl(var(--primary)/0.3)" : "0 0 0 0px hsl(var(--primary))",
                          borderColor: highlightField ? "hsl(var(--primary))" : "inherit"
                        }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl overflow-hidden"
                      >
                        <Textarea 
                          {...field} 
                          className={`min-h-[250px] font-mono text-sm leading-relaxed transition-colors duration-300 ${highlightField ? 'bg-primary/5 border-primary' : ''}`} 
                          placeholder="Defina as regras, o tom de voz e o conhecimento base deste assistente..."
                        />
                      </motion.div>
                    </FormControl>
                    <FormDescription>
                      Isso funciona como o prompt principal do Gemini. Instrua detalhadamente como o assistente deve se comportar. Você pode editá-las manualmente após a geração pela IA.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <StandardDialogFooter>
          <div className="flex justify-between w-full">
            {initialData && onDelete ? (
              <Button
                variant="destructive"
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            ) : (
              <div />
            )}
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" form="assistant-form" disabled={isSaving}>
                {isSaving ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </StandardDialogFooter>
      </DialogContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Assistente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este assistente? Esta ação não pode ser desfeita e todas as conversas associadas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (initialData && onDelete) {
                  onDelete(initialData.id);
                  setDeleteDialogOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
