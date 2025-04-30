
import { Task } from "@/types";
import { Phone, MapPin } from "lucide-react";

interface TaskDetailsContentProps {
  task: Task;
}

export function TaskDetailsContent({ task }: TaskDetailsContentProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-sm">Descrição</h4>
        <p className="text-sm text-muted-foreground">{task.description || "Sem descrição"}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm">Status</h4>
          <p className="text-sm text-muted-foreground capitalize">
            {task.status.replace('_', ' ')}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm">Prioridade</h4>
          <p className="text-sm text-muted-foreground capitalize">
            {task.priority}
          </p>
        </div>
      </div>
      
      {task.clientName && (
        <div>
          <h4 className="font-semibold text-sm">Cliente</h4>
          <p className="text-sm text-muted-foreground">{task.clientName}</p>
        </div>
      )}
      
      {task.clientPhone && (
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">Telefone</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone size={14} /> {task.clientPhone}
          </p>
        </div>
      )}
      
      {task.clientAddress && (
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-sm">Endereço</h4>
          <p className="text-sm text-muted-foreground flex items-start gap-1">
            <MapPin size={14} className="mt-0.5" /> {task.clientAddress}
          </p>
        </div>
      )}
    </div>
  );
}
