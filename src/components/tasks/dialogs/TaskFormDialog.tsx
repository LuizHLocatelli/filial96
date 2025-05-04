
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskFormContent } from "../form/TaskFormContent";
import { useTaskForm } from "@/hooks/useTaskForm";
import { TaskAttachments } from "../attachments/TaskAttachments";

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

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
    onOpenChange(open);
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <TaskFormContent control={form.control} />
            
            {isEditMode && taskId && (
              <TaskAttachments taskId={taskId} />
            )}
            
            <DialogFooter className="pt-4">
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
