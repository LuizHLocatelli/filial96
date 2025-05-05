
import { CreateTaskFormState } from "@/hooks/tasks/useCreateTask";
import { Button } from "@/components/ui/button";
import { CreateTaskFormContent } from "../form/CreateTaskFormContent";
import { TaskType } from "@/types";

interface TaskCreationFormProps {
  task: CreateTaskFormState;
  taskType: TaskType;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export function TaskCreationForm({
  task,
  taskType,
  isSubmitting,
  onCancel,
  onSubmit,
  handleInputChange,
  handleSelectChange,
}: TaskCreationFormProps) {
  return (
    <>
      <CreateTaskFormContent 
        task={task} 
        handleInputChange={handleInputChange} 
        handleSelectChange={handleSelectChange}
        taskType={taskType}
      />
      
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onSubmit}
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </>
  );
}
