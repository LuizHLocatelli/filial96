
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskDetailsActionsProps {
  task: Task;
  onEdit: () => void;
  onDelete?: (task: Task) => void;
  onClose: () => void;
}

export function TaskDetailsActions({ task, onEdit, onDelete, onClose }: TaskDetailsActionsProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? "flex-col w-full" : "justify-between"} gap-2`}>
      <div className={`flex ${isMobile ? "flex-col w-full" : ""} gap-2`}>
        <Button 
          onClick={() => {
            onClose();
            onEdit();
          }}
          variant="outline"
          className={isMobile ? "w-full" : ""}
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
            className={isMobile ? "w-full" : ""}
          >
            Excluir
          </Button>
        )}
      </div>
      
      <Button 
        variant="outline" 
        onClick={onClose}
        className={isMobile ? "w-full" : ""}
      >
        Fechar
      </Button>
    </div>
  );
}
