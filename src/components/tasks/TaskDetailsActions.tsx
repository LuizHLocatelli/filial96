
import { Task } from "@/types";
import { Button } from "@/components/ui/button";

interface TaskDetailsActionsProps {
  task: Task;
  onEdit: () => void;
  onDelete?: (task: Task) => void;
  onClose: () => void;
}

export function TaskDetailsActions({ task, onEdit, onDelete, onClose }: TaskDetailsActionsProps) {
  return (
    <div className="flex justify-between gap-2">
      <div className="flex gap-2">
        <Button 
          onClick={() => {
            onClose();
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
              onClose();
            }}
          >
            Excluir
          </Button>
        )}
      </div>
      
      <Button variant="outline" onClick={onClose}>
        Fechar
      </Button>
    </div>
  );
}
