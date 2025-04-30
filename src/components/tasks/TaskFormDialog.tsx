
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

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  initialData?: Partial<Task>;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

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

  const [task, setTask] = useState<Partial<Task>>({
    type: "montagem",
    title: "",
    description: "",
    status: "pendente",
    priority: "media",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
  });

  // Set initial data when the component mounts or when initialData changes
  useEffect(() => {
    if (initialData) {
      setTask({
        type: initialData.type || "montagem",
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "pendente",
        priority: initialData.priority || "media",
        clientName: initialData.clientName || "",
        clientPhone: initialData.clientPhone || "",
        clientAddress: initialData.clientAddress || "",
      });
    }
  }, [initialData, open]);

  // Update currentTaskId when taskId prop changes
  useEffect(() => {
    setCurrentTaskId(taskId);
  }, [taskId, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setTask({
      type: "montagem",
      title: "",
      description: "",
      status: "pendente",
      priority: "media",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
    });
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleSaveTask = async () => {
    if (!task.title) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um título para a tarefa.",
        variant: "destructive",
      });
      return;
    }

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
      if (isEditMode && currentTaskId) {
        // Atualizar tarefa existente
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            client_name: task.clientName,
            client_phone: task.clientPhone,
            client_address: task.clientAddress,
            updated_at: new Date().toISOString(),
          })
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
            type: task.type,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            client_name: task.clientName,
            client_phone: task.clientPhone,
            client_address: task.clientAddress,
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

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="title">Título da Montagem*</Label>
            <Input 
              id="title"
              name="title"
              value={task.title}
              onChange={handleInputChange}
              placeholder="Ex: Montagem de guarda-roupa"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description"
              name="description"
              value={task.description || ""}
              onChange={handleInputChange}
              placeholder="Detalhes sobre a montagem"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={task.priority} 
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={task.status} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input 
              id="clientName"
              name="clientName"
              value={task.clientName || ""}
              onChange={handleInputChange}
              placeholder="Nome completo do cliente"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="clientPhone">Telefone do Cliente</Label>
              <Input 
                id="clientPhone"
                name="clientPhone"
                value={task.clientPhone || ""}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="clientAddress">Endereço do Cliente</Label>
            <Input 
              id="clientAddress"
              name="clientAddress"
              value={task.clientAddress || ""}
              onChange={handleInputChange}
              placeholder="Endereço completo para montagem"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => handleDialogOpen(false)}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveTask}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Salvar Tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
