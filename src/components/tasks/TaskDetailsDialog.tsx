
import { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskDetailsContent } from "./TaskDetailsContent";
import { TaskDetailsActions } from "./TaskDetailsActions";

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
        
        <TaskDetailsContent task={task} />
        
        <DialogFooter>
          <TaskDetailsActions 
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onClose={() => onOpenChange(false)}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
