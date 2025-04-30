
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  initialData?: Partial<Task>;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

// Define a schema for form validation
const taskFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  observation: z.string().optional(),
  status: z.string().default("pendente"),
  priority: z.string().default("media"),
  clientName: z.string().min(1, "O nome do cliente é obrigatório"),
  clientPhone: z.string().min(8, "O telefone deve ter pelo menos 8 dígitos"),
  clientAddress: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  products: z.string().min(1, "Os produtos são obrigatórios"),
  purchaseDate: z.date().optional(),
  expectedArrivalDate: z.date().optional(),
  expectedDeliveryDate: z.date().optional(),
  clientCpf: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export function TaskFormDialog({
  open,
  onOpenChange,
  taskId,
  initialData,
  isEditMode = false,
  onSuccess,
}: TaskFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(taskId);

  // Create form with React Hook Form + Zod
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      observation: "",
      status: "pendente",
      priority: "media",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
      products: "",
      clientCpf: "",
    }
  });

  // Set initial data when the component mounts or when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        observation: initialData.observation || "",
        status: initialData.status || "pendente",
        priority: initialData.priority || "media",
        clientName: initialData.clientName || "",
        clientPhone: initialData.clientPhone || "",
        clientAddress: initialData.clientAddress || "",
        products: initialData.products || "",
        purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate) : undefined,
        expectedArrivalDate: initialData.expectedArrivalDate ? new Date(initialData.expectedArrivalDate) : undefined,
        expectedDeliveryDate: initialData.expectedDeliveryDate ? new Date(initialData.expectedDeliveryDate) : undefined,
        clientCpf: initialData.clientCpf || "",
      });
    }
  }, [initialData, open, form]);

  // Update currentTaskId when taskId prop changes
  useEffect(() => {
    setCurrentTaskId(taskId);
  }, [taskId, isEditMode]);

  const resetForm = () => {
    form.reset({
      title: "",
      observation: "",
      status: "pendente",
      priority: "media",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
      products: "",
      purchaseDate: undefined,
      expectedArrivalDate: undefined,
      expectedDeliveryDate: undefined,
      clientCpf: "",
    });
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleSaveTask = async (data: TaskFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma tarefa.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Saving task with ID:", currentTaskId, "isEditMode:", isEditMode);

    try {
      const taskData = {
        title: data.title,
        description: "", // Keeping this for compatibility but not using it in form
        observation: data.observation || "",
        status: data.status,
        priority: data.priority,
        client_name: data.clientName,
        client_phone: data.clientPhone,
        client_address: data.clientAddress,
        products: data.products,
        purchase_date: data.purchaseDate?.toISOString(),
        expected_arrival_date: data.expectedArrivalDate?.toISOString(),
        expected_delivery_date: data.expectedDeliveryDate?.toISOString(),
        client_cpf: data.clientCpf || "",
        type: initialData?.type || "entrega",
        updated_at: new Date().toISOString(),
      };

      if (isEditMode && currentTaskId) {
        // Atualizar tarefa existente
        const { error: updateError } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", currentTaskId);

        if (updateError) {
          throw new Error(`Erro ao atualizar tarefa: ${updateError.message}`);
        }

        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        // Criar nova tarefa - certifique-se de que temos um ID válido
        const taskInsertId = currentTaskId || undefined; // Don't send empty string
        
        const { error: taskError } = await supabase
          .from("tasks")
          .insert({
            id: taskInsertId,
            ...taskData,
            created_by: user.id,
          });

        if (taskError) {
          throw new Error(`Erro ao criar tarefa: ${taskError.message}`);
        }

        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso.",
        });
      }

      // Limpar o formulário e fechar o diálogo
      resetForm();
      onOpenChange(false);
      
      // Callback para comunicar sucesso ao componente pai
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Edite os detalhes da tarefa abaixo' : 'Preencha os detalhes da tarefa abaixo'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveTask)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Entrega de sofá" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produtos Comprados*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sofá 3 lugares, Mesa de centro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Compra</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedArrivalDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Previsão de Chegada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expectedDeliveryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Previsão de Entrega/Retirada</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade*</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente pela Loja</SelectItem>
                        <SelectItem value="aguardando_cliente">Aguardando o Cliente</SelectItem>
                        <SelectItem value="concluida">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientCpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone do Cliente*</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="clientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço do Cliente*</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleDialogOpen(false)}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Salvar Tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
