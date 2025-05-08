
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  // Estado para controlar qual tab está ativa
  const [activeTab, setActiveTab] = useState<string>("detalhes");

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      handleCancel();
      setNewTaskId(undefined);
      setActiveTab("detalhes");
    }
    onOpenChange(open);
  };

  // Função para lidar com o sucesso da criação da tarefa
  const handleTaskSubmit = async (data: any) => {
    const result = await handleSubmit(data);
    if (result?.taskId) {
      setNewTaskId(result.taskId);
      
      // Vamos mudar para a aba de anexos automaticamente após criar a tarefa
      if (!isEditMode) {
        setActiveTab("anexos");
      }
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleTaskSubmit)} className="space-y-4">
            {!newTaskId || isEditMode ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger 
                    value="anexos" 
                    disabled={!newTaskId && !isEditMode}
                  >
                    Anexos
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="detalhes" className="space-y-4 mt-0">
                  <TaskFormContent control={form.control} />
                </TabsContent>
                
                <TabsContent value="anexos" className="space-y-4 mt-0">
                  {(isEditMode || newTaskId) ? (
                    <TaskAttachments taskId={isEditMode ? taskId : newTaskId} />
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Salve a tarefa primeiro para adicionar anexos
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              // Quando uma nova tarefa foi criada e temos o ID, mostrar apenas a aba de anexos
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Tarefa criada com sucesso!</h3>
                  <p className="text-sm text-muted-foreground">Agora você pode adicionar anexos à tarefa.</p>
                </div>
                
                <TaskAttachments taskId={newTaskId} />
              </div>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
              <Button 
                variant="outline" 
                onClick={() => handleDialogOpen(false)}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                type="button"
              >
                {newTaskId && !isEditMode ? "Concluir" : "Cancelar"}
              </Button>
              
              {(!newTaskId || isEditMode) && activeTab === "detalhes" && (
                <Button 
                  type="submit"
                  className="w-full sm:w-auto ml-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Salvar Tarefa"}
                </Button>
              )}
              
              {(!newTaskId || isEditMode) && activeTab === "anexos" && (
                <Button 
                  type="button"
                  className="w-full sm:w-auto ml-auto"
                  onClick={() => handleDialogOpen(false)}
                >
                  Concluir
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
