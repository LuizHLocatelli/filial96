
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskType } from "@/types";
import { useCreateTask } from "@/hooks/tasks/useCreateTask";
import { TaskCreationForm } from "./create/TaskCreationForm";
import { TaskCreationSuccess } from "./create/TaskCreationSuccess";

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
  const {
    task,
    isSubmitting,
    isTaskCreated,
    createdTaskId,
    handleInputChange,
    handleSelectChange,
    handleCreateTask,
    resetForm,
    getTaskTypeName,
  } = useCreateTask({
    taskType
  });

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova {title}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da {getTaskTypeName(taskType)} abaixo
          </DialogDescription>
        </DialogHeader>
        
        {!isTaskCreated ? (
          <TaskCreationForm
            task={task}
            taskType={taskType}
            isSubmitting={isSubmitting}
            onCancel={() => handleDialogOpen(false)}
            onSubmit={handleCreateTask}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
          />
        ) : (
          <TaskCreationSuccess 
            taskId={createdTaskId} 
            onClose={() => handleDialogOpen(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
