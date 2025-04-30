
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Attachment, Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FileUploader } from "@/components/tasks/FileUploader";
import { AttachmentList } from "@/components/tasks/AttachmentList";
import { v4 as uuidv4 } from "uuid";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Montagens() {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskAttachments, setNewTaskAttachments] = useState<Attachment[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: "montagem",
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
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileUploaded = (attachment: Attachment) => {
    setNewTaskAttachments(prev => [...prev, attachment]);
    toast({
      title: "Anexo adicionado",
      description: `${attachment.name} foi adicionado à tarefa.`,
    });
  };
  
  const handleAttachmentDeleted = (attachmentId: string) => {
    setNewTaskAttachments(prev => prev.filter(att => att.id !== attachmentId));
    toast({
      title: "Anexo removido",
      description: "O anexo foi removido com sucesso.",
    });
  };
  
  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um título para a montagem.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Gerar um ID para a nova tarefa
      const taskId = uuidv4();
      
      // Criar a nova tarefa
      const { error: taskError } = await supabase
        .from("tasks")
        .insert({
          id: taskId,
          type: newTask.type,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          client_name: newTask.clientName,
          client_phone: newTask.clientPhone,
          client_address: newTask.clientAddress,
          created_by: "system", // Em uma aplicação real, seria o ID do usuário atual
        });
      
      if (taskError) {
        throw new Error(`Erro ao criar tarefa: ${taskError.message}`);
      }
      
      toast({
        title: "Montagem criada",
        description: "A nova montagem foi criada com sucesso.",
      });
      
      // Limpar o formulário e fechar o diálogo
      setNewTask({
        type: "montagem",
        title: "",
        description: "",
        status: "pendente",
        priority: "media",
        clientName: "",
        clientPhone: "",
        clientAddress: "",
      });
      setNewTaskAttachments([]);
      setIsNewTaskDialogOpen(false);
      
    } catch (error) {
      console.error("Erro ao criar montagem:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a montagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Montagens</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie montagens de móveis para clientes.
          </p>
        </div>
        <Button 
          className="flex items-center gap-2 w-full sm:w-auto justify-center" 
          onClick={() => setIsNewTaskDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nova Montagem
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4 text-center px-4">
          Módulo de gerenciamento de montagens em desenvolvimento
        </p>
        <Button onClick={() => setIsNewTaskDialogOpen(true)}>Criar Nova Montagem</Button>
      </div>
      
      {/* Diálogo para criar nova montagem */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Montagem</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">Título da Montagem*</Label>
              <Input 
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Ex: Montagem de guarda-roupa"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description"
                name="description"
                value={newTask.description || ""}
                onChange={handleInputChange}
                placeholder="Detalhes sobre a montagem"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={newTask.priority} 
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
                  value={newTask.status} 
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
                value={newTask.clientName || ""}
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
                  value={newTask.clientPhone || ""}
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
                value={newTask.clientAddress || ""}
                onChange={handleInputChange}
                placeholder="Endereço completo para montagem"
              />
            </div>
            
            {/* Seção de Anexos */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium mb-2">Anexos</h4>
              <AttachmentList 
                attachments={newTaskAttachments} 
                onAttachmentDeleted={handleAttachmentDeleted} 
              />
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Adicionar anexo</h4>
                <FileUploader 
                  taskId={uuidv4()}  // ID temporário para o uploader
                  onFileUploaded={handleFileUploaded} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsNewTaskDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateTask}
              className="w-full sm:w-auto"
            >
              Salvar Montagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
