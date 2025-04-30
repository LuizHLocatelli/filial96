
import { TaskType } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateTaskFormContentProps {
  task: {
    title: string;
    observation: string;
    status: string;
    priority: string;
    clientName: string;
    clientPhone: string;
    clientAddress: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  taskType: TaskType;
}

export function CreateTaskFormContent({
  task,
  handleInputChange,
  handleSelectChange,
  taskType
}: CreateTaskFormContentProps) {
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
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="title">Título*</Label>
        <Input 
          id="title"
          name="title"
          value={task.title}
          onChange={handleInputChange}
          placeholder={`Ex: ${getTaskTypeName(taskType)} para cliente`}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="observation">Observação</Label>
        <Textarea 
          id="observation"
          name="observation"
          value={task.observation || ""}
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
    </div>
  );
}
