
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
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskAttachments } from "./attachments/TaskAttachments";
import { Separator } from "@/components/ui/separator";

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
  const [activeTab, setActiveTab] = useState<string>("details");
  
  if (!task) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Detalhes da tarefa
          </DialogDescription>
        </DialogHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-0">
            <TaskDetailsContent task={task} />
          </TabsContent>
          
          <TabsContent value="attachments" className="mt-0">
            {task.id ? (
              <TaskAttachments taskId={task.id} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Não é possível adicionar anexos antes de salvar a tarefa.
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
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
