
import { useState } from "react";
import { Task } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function useTaskDialogs() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isEntregaDialogOpen, setIsEntregaDialogOpen] = useState(false);
  const [isRetiradaDialogOpen, setIsRetiradaDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskId, setTaskId] = useState<string>("");

  const handleDialogOpen = (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return (open: boolean) => {
      if (!open) {
        // Se estiver fechando o diálogo e não estamos no modo de edição
        if (!isEditMode) {
          setSelectedTask(null);
        }
        
        dialogSetter(false);
        return;
      }
      
      if (!isEditMode) {
        // Generate a new task ID when dialog opens for new task
        setTaskId(uuidv4());
      }
      
      dialogSetter(open);
    };
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskId(task.id);
    setIsEditMode(true);
    
    if (task.type === 'entrega') {
      setIsEntregaDialogOpen(true);
    } else if (task.type === 'retirada') {
      setIsRetiradaDialogOpen(true);
    }
  };

  const handleCreateTask = (type: 'entrega' | 'retirada') => {
    setIsEditMode(false);
    setSelectedTask(null);
    setTaskId(uuidv4());
    
    if (type === 'entrega') {
      setIsEntregaDialogOpen(true);
    } else {
      setIsRetiradaDialogOpen(true);
    }
  };
  
  const handleTaskSuccess = () => {
    setSelectedTask(null);
    setIsEditMode(false);
  };

  return {
    selectedTask,
    isTaskDetailsOpen,
    isEntregaDialogOpen,
    isRetiradaDialogOpen,
    isEditMode,
    taskId,
    setIsTaskDetailsOpen,
    handleDialogOpen,
    handleTaskClick,
    handleEditTask,
    handleCreateTask,
    handleTaskSuccess
  };
}
