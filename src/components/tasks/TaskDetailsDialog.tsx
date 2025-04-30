
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, MapPin } from "lucide-react";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onEdit: () => void;
  onDelete?: (task: Task) => void;
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
  onEdit,
  onDelete,
}: TaskDetailsDialogProps) {
  if (!task) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Detalhes da tarefa
          </DialogDescription>
        </DialogHeader>
        
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
        
        <DialogFooter className="flex justify-between gap-2">
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
              variant="outline"
            >
              Editar
            </Button>
            
            {onDelete && (
              <Button 
                variant="destructive"
                onClick={() => {
                  if (onDelete) onDelete(task);
                  onOpenChange(false);
                }}
              >
                Excluir
              </Button>
            )}
          </div>
          
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
