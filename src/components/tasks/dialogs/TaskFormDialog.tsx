
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
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  initialData?: Partial<Task>;
  isEditMode?: boolean;
  onSuccess?: (taskId?: string) => void;
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
    onSuccess: (taskId?: string) => {
      // When task is successfully created or edited, pass the taskId to the parent component
      if (onSuccess && taskId) {
        onSuccess(taskId);
      }
    },
    onCancel: () => onOpenChange(false)
  });
  const isMobile = useIsMobile();

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
      // Close the dialog after successful submission and let the parent component handle the redirection
      if (!isEditMode) {
        handleDialogOpen(false);
        if (onSuccess) {
          onSuccess(result.taskId);
        }
      }
    }
    return result;
  };

  // Verifica se há um ID de tarefa disponível (seja por edição ou após criar)
  const hasTaskId = Boolean(taskId || newTaskId);

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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="anexos">Anexos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="detalhes" className="space-y-4 mt-0 overflow-y-auto max-h-[60vh]">
                <TaskFormContent control={form.control} />
                
                <div className={`flex ${isMobile ? "flex-col gap-2" : "flex-row justify-end"} mt-4`}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDialogOpen(false)}
                    className={`${isMobile ? "w-full order-1" : "mr-2"}`}
                    disabled={isSubmitting}
                    type="button"
                  >
                    Cancelar
                  </Button>
                  
                  <Button 
                    type="submit"
                    className={`${isMobile ? "w-full order-0" : ""}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Salvar Tarefa"}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="anexos" className="space-y-4 mt-0 overflow-y-auto max-h-[60vh]">
                {/* Explicação condicional se a tarefa ainda não foi salva */}
                {!hasTaskId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      Para adicionar anexos, primeiro salve a tarefa na aba Detalhes.
                    </p>
                  </div>
                )}
                
                {/* Mostrar os anexos se temos um ID de tarefa */}
                {hasTaskId ? (
                  <TaskAttachments taskId={newTaskId || taskId} />
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-md bg-muted/30">
                    <p className="text-muted-foreground">
                      Salve a tarefa primeiro para adicionar anexos
                    </p>
                  </div>
                )}
                
                <div className={`flex ${isMobile ? "flex-col gap-2" : "flex-row justify-end"} mt-4`}>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDialogOpen(false)}
                    className={isMobile ? "w-full" : ""}
                    type="button"
                  >
                    {hasTaskId ? "Concluir" : "Cancelar"}
                  </Button>
                  
                  {/* Se não houver ID da tarefa, mostrar botão para voltar à aba de detalhes */}
                  {!hasTaskId && (
                    <Button 
                      type="button"
                      className={isMobile ? "w-full" : "ml-2"}
                      onClick={() => setActiveTab("detalhes")}
                    >
                      Voltar aos Detalhes
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
