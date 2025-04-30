
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
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
import { FileUploader } from "./FileUploader";
import { AttachmentList } from "./AttachmentList";
import { Attachment, TaskType } from "@/types";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskType: TaskType;
  title: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  taskType,
  title,
}: CreateTaskDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskId, setTaskId] = useState<string>(uuidv4());
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [task, setTask] = useState({
    title: "",
    description: "",
    status: "pendente",
    priority: "media",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileUploaded = (attachment: Attachment) => {
    setAttachments(prev => [...prev, attachment]);
    toast({
      title: "Anexo adicionado",
      description: `${attachment.name} foi adicionado à tarefa.`,
    });
  };
  
  const handleAttachmentDeleted = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    toast({
      title: "Anexo removido",
      description: "O anexo foi removido com sucesso.",
    });
  };
  
  const resetForm = () => {
    setTask({
      title: "",
      description: "",
      status: "pendente",
      priority: "media",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
    });
    setAttachments([]);
    setTaskId(uuidv4());
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleCreateTask = async () => {
    if (!task.title) {
      toast({
        title: "Erro",
        description: `Por favor, adicione um título para a ${getTaskTypeName(taskType)}.`,
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
    
    try {
      // Criar a nova tarefa
      const { error: taskError } = await supabase
        .from("tasks")
        .insert({
          id: taskId,
          type: taskType,
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
        description: `A nova ${getTaskTypeName(taskType)} foi criada com sucesso.`,
      });
      
      // Limpar o formulário e fechar o diálogo
      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to get a friendly name for the task type
  function getTaskTypeName(type: TaskType): string {
    const typeNames: Record<TaskType, string> = {
      entrega: "entrega",
      retirada: "retirada",
      montagem: "montagem",
      garantia: "garantia",
      organizacao: "organização",
      cobranca: "cobrança"
    };
    return typeNames[type] || "tarefa";
  }
  
  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova {title}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da {getTaskTypeName(taskType)} abaixo
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="title">Título*</Label>
            <Input 
              id="title"
              name="title"
              value={task.title}
              onChange={handleInputChange}
              placeholder={`Ex: ${title} para cliente`}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description"
              name="description"
              value={task.description || ""}
              onChange={handleInputChange}
              placeholder={`Detalhes sobre a ${getTaskTypeName(taskType)}`}
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
              placeholder="Endereço completo"
            />
          </div>
          
          {/* Seção de Anexos */}
          <div className="border-t pt-4 mt-2">
            <h4 className="font-medium mb-2">Anexos</h4>
            <AttachmentList 
              attachments={attachments} 
              onAttachmentDeleted={handleAttachmentDeleted} 
            />
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Adicionar anexo</h4>
              <FileUploader 
                taskId={taskId}
                onFileUploaded={handleFileUploaded} 
              />
              <p className="text-xs text-muted-foreground mt-2">
                OBS: Os anexos serão salvos após a criação da tarefa.
              </p>
            </div>
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
            onClick={handleCreateTask}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
