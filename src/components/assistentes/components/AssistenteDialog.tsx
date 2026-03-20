import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Save, Trash2, Sparkles, Loader2, Globe, Thermometer } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AssistantDocumentsTab } from "./AssistantDocumentsTab";
import { useGenerateSystemMessage } from "../hooks/useGenerateSystemMessage";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { AIAssistant } from "../types";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(50),
  description: z.string().max(200).optional(),
  system_message: z.string().min(10, "Instruções devem ser detalhadas").max(8000),
  avatar_icon: z.string().max(2).optional(),
  web_search_enabled: z.boolean().optional(),
  temperature_level: z.enum(['low', 'medium', 'high']).optional(),
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
      avatar_icon: "🧠",
      web_search_enabled: false,
      temperature_level: "medium",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description || "",
          system_message: initialData.system_message,
          avatar_icon: initialData.avatar_icon || "🧠",
          web_search_enabled: initialData.web_search_enabled || false,
          temperature_level: initialData.temperature_level || "medium",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          system_message: "Você é um assistente prestativo e especializado em responder dúvidas com clareza e precisão.",
          avatar_icon: "🧠",
          web_search_enabled: false,
          temperature_level: "medium",
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
      avatar_icon: data.avatar_icon || "🧠",
      web_search_enabled: data.web_search_enabled || false,
      temperature_level: data.temperature_level || "medium",
    } as Omit<AIAssistant, "id" | "created_at" | "updated_at" | "user_id">);
  };

  const handleClose = () => onOpenChange(false);

  const handleGeneratePrompt = async () => {
    if (!promptPurpose.trim()) {
      toast.warning("Por favor, descreva o propósito antes de gerar.");
      return;
    }
    const name = form.getValues("name");
    const description = form.getValues("description") || "";
    const result = await generate(promptPurpose, name, description);
    if (result && result.system_message) {
      form.setValue("system_message", result.system_message, { shouldValidate: true, shouldDirty: true });
      if (result.suggested_emoji && result.suggested_emoji.length <= 2) {
        form.setValue("avatar_icon", result.suggested_emoji, { shouldValidate: true, shouldDirty: true });
      }
      setHighlightField(true);
      setTimeout(() => setHighlightField(false), 2000);
      toast.success("Instruções e ícone gerados com sucesso!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col p-0" hideCloseButton>
        <StandardDialogHeader icon={Bot} title={initialData ? "Editar Assistente" : "Novo Assistente"} onClose={handleClose} />

        <DialogScrollableContainer>
          <Form {...form}>
            <form id="assistant-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="config" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="config">⚙️ Configuração</TabsTrigger>
                  <TabsTrigger value="documents">📄 Documentos (RAG)</TabsTrigger>
                </TabsList>

                <TabsContent value="config">
                  <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <FormField control={form.control} name="avatar_icon" render={({ field }) => (
                      <FormItem className="w-20 shrink-0">
                        <FormLabel>Ícone</FormLabel>
                        <FormControl>
                          <motion.div
                            animate={{
                              boxShadow: highlightField ? "0 0 0 2px hsl(var(--primary)), 0 0 15px hsl(var(--primary)/0.3)" : "0 0 0 0px hsl(var(--primary))",
                            }}
                            transition={{ duration: 0.3 }}
                            className="rounded-md"
                          >
                            <Input {...field} className="text-center text-2xl h-10 transition-colors" placeholder="🧠" maxLength={2} />
                          </motion.div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nome do Assistente *</FormLabel>
                        <FormControl><Input {...field} placeholder="Ex: Especialista Financeiro" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breve Descrição</FormLabel>
                      <FormControl><Input {...field} placeholder="Uma frase explicando o propósito" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Web Search Toggle */}
                  <FormField control={form.control} name="web_search_enabled" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary" />
                        <div>
                          <FormLabel className="text-sm font-medium cursor-pointer">Busca na Web</FormLabel>
                          <FormDescription className="text-xs">
                            Permite que o assistente pesquise na internet para respostas atualizadas.
                          </FormDescription>
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* Temperature Level Select */}
                  <FormField control={form.control} name="temperature_level" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Thermometer className="w-5 h-5 text-primary" />
                        <div>
                          <FormLabel className="text-sm font-medium cursor-pointer">Nível de Temperatura</FormLabel>
                          <FormDescription className="text-xs">
                            Controla a criatividade das respostas. Baixa = mais factual.
                          </FormDescription>
                        </div>
                      </div>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value || 'medium'}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              🧊 Baixa (0.1) - Respostas factuais
                            </SelectItem>
                            <SelectItem value="medium">
                              ⚖️ Média (0.4) - Equilíbrio
                            </SelectItem>
                            <SelectItem value="high">
                              🔥 Alta (0.7) - Mais criativa
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )} />

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Sparkles className="w-4 h-4" />
                      <h3>Gerar Instruções com IA</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Descreva como você quer que o assistente se comporte e deixe a IA criar as instruções detalhadas e sugerir um ícone.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Ex: Quero um assistente especialista em vendas..."
                        value={promptPurpose}
                        onChange={(e) => setPromptPurpose(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGeneratePrompt(); } }}
                      />
                      <Button type="button" variant="default" className="shrink-0 w-full sm:w-auto" onClick={handleGeneratePrompt} disabled={isGenerating || !promptPurpose.trim()}>
                        {isGenerating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Gerar</>)}
                      </Button>
                    </div>
                  </div>

                  <FormField control={form.control} name="system_message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruções do Sistema (Cérebro do IA) *</FormLabel>
                      <FormControl>
                        <motion.div
                          animate={{
                            boxShadow: highlightField ? "0 0 0 2px hsl(var(--primary)), 0 0 15px hsl(var(--primary)/0.3)" : "0 0 0 0px hsl(var(--primary))",
                          }}
                          transition={{ duration: 0.3 }}
                          className="rounded-xl overflow-hidden"
                        >
                          <Textarea
                            {...field}
                            className={`min-h-[180px] sm:min-h-[250px] font-mono text-sm leading-relaxed transition-colors duration-300 ${highlightField ? 'bg-primary/5 border-primary' : ''}`}
                            placeholder="Defina as regras, o tom de voz e o conhecimento base deste assistente..."
                          />
                        </motion.div>
                      </FormControl>
                      <FormDescription>
                        Isso funciona como o prompt principal do Gemini. Instrua detalhadamente como o assistente deve se comportar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  <AssistantDocumentsTab assistantId={initialData?.id} />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </DialogScrollableContainer>

        <StandardDialogFooter>
          <div className="flex justify-between w-full">
            {initialData && onDelete ? (
              <Button variant="destructive" type="button" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />Excluir
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button type="submit" form="assistant-form" disabled={isSaving}>
                {isSaving ? "Salvando..." : (<><Save className="w-4 h-4 mr-2" />Salvar</>)}
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
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (initialData && onDelete) { onDelete(initialData.id); setDeleteDialogOpen(false); } }}
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
