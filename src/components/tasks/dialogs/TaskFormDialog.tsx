
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskFormContent } from "../form/TaskFormContent";
import { useTaskForm } from "@/hooks/useTaskForm";
import { TaskAttachments } from "../attachments/TaskAttachments";
import { useState } from "react";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  initialData?: Partial<Task>;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  taskId,
  initialData,
  isEditMode = false,
  onSuccess,
}: TaskFormDialogProps) {
  const {
    form,
    isSubmitting,
    handleSubmit,
    handleCancel
  } = useTaskForm({
    taskId,
    initialData,
    isEditMode,
    onSuccess,
    onCancel: () => onOpenChange(false)
  });

  // Estado local para armazenar o ID da tarefa após a criação
  const [newTaskId, setNewTaskId] = useState<string | undefined>(taskId);
  // Estado para controlar se o formulário foi enviado com sucesso
  const [isTaskCreated, setIsTaskCreated] = useState(false);

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      handleCancel();
      setNewTaskId(undefined);
      setIsTaskCreated(false);
    }
    onOpenChange(open);
  };

  // Função para lidar com o sucesso da criação da tarefa
  const handleTaskSubmit = async (data: any) => {
    const result = await handleSubmit(data);
    if (result?.taskId) {
      setNewTaskId(result.taskId);
      setIsTaskCreated(true);
    }
    return result;
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Edite os detalhes da tarefa abaixo' : 'Preencha os detalhes da tarefa abaixo'}
          </DialogDescription>
        </DialogHeader>

        {!isTaskCreated ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleTaskSubmit)} className="space-y-4">
              <TaskFormContent control={form.control} />
              
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDialogOpen(false)}
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Salvar Tarefa"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Tarefa criada com sucesso!</h3>
              <p className="text-sm text-muted-foreground">Agora você pode adicionar anexos à tarefa.</p>
            </div>
            
            <TaskAttachments taskId={newTaskId} />
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => handleDialogOpen(false)}
              >
                Concluir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
