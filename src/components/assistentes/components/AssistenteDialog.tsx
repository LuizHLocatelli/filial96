import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Save, Trash2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import type { AIAssistant } from "../types";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(50),
  description: z.string().max(200).optional(),
  system_message: z.string().min(10, "Instruções devem ser detalhadas").max(2000),
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
                    <FormItem className="w-20 shrink-0">
                      <FormLabel>Ícone</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-center text-2xl" placeholder="🤖" maxLength={2} />
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

              <FormField
                control={form.control}
                name="system_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções do Sistema (Cérebro do IA) *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="min-h-[250px] font-mono text-sm leading-relaxed" 
                        placeholder="Defina as regras, o tom de voz e o conhecimento base deste assistente..."
                      />
                    </FormControl>
                    <FormDescription>
                      Isso funciona como o prompt principal do Gemini. Instrua detalhadamente como o assistente deve se comportar.
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
                onClick={() => {
                  if (confirm("Tem certeza que deseja apagar este assistente?")) {
                    onDelete(initialData.id);
                  }
                }}
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
    </Dialog>
  );
}
