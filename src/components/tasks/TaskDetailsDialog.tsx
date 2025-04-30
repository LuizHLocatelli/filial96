
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

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onEdit: () => void;
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
  onEdit,
}: TaskDetailsDialogProps) {
  if (!task) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Detalhes da montagem
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
            <div>
              <h4 className="font-semibold text-sm">Telefone</h4>
              <p className="text-sm text-muted-foreground">{task.clientPhone}</p>
            </div>
          )}
          
          {task.clientAddress && (
            <div>
              <h4 className="font-semibold text-sm">Endereço</h4>
              <p className="text-sm text-muted-foreground">{task.clientAddress}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
            variant="outline"
          >
            Editar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
