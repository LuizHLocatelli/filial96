
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  if (!task) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 sm:p-6">
          <DialogTitle className="text-lg sm:text-xl break-words">{task.title}</DialogTitle>
          <DialogDescription>
            Detalhes da tarefa
          </DialogDescription>
        </DialogHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4 px-4 sm:px-0">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-0 px-4 sm:px-6 overflow-y-auto">
            <TaskDetailsContent task={task} />
          </TabsContent>
          
          <TabsContent value="attachments" className="mt-0 px-4 sm:px-6 overflow-y-auto">
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
        
        <DialogFooter className={`px-4 sm:px-6 ${isMobile ? "flex-col gap-2" : ""}`}>
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
