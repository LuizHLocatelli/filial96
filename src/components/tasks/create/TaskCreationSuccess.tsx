
import { Button } from "@/components/ui/button";
import { TaskAttachments } from "../attachments/TaskAttachments";

interface TaskCreationSuccessProps {
  taskId: string | undefined;
  onClose: () => void;
}

export function TaskCreationSuccess({ taskId, onClose }: TaskCreationSuccessProps) {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium">Tarefa criada com sucesso!</h3>
        <p className="text-sm text-muted-foreground">Agora você pode adicionar anexos à tarefa.</p>
      </div>
      
      <TaskAttachments taskId={taskId} />
      
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
        <Button 
          onClick={onClose}
          className="w-full"
        >
          Concluir
        </Button>
      </div>
    </>
  );
}
