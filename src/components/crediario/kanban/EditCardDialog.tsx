
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TaskCard } from "./types";
import { CardFormFields } from "./form/CardFormFields";
import { useCardForm } from "./form/useCardForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditCardDialogProps {
  card: TaskCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<TaskCard>) => void;
}

export function EditCardDialog({
  card,
  open,
  onOpenChange,
  onUpdate
}: EditCardDialogProps) {
  const isMobile = useIsMobile();
  
  const handleSubmit = async (values: any) => {
    onUpdate({
      title: values.title,
      description: values.description,
      priority: values.priority,
      assignee_id: values.assigneeId,
      due_date: values.dueDate ? values.dueDate.toISOString() : undefined,
      due_time: values.dueTime,
      background_color: values.backgroundColor
    });
    
    onOpenChange(false);
  };
  
  const { form, isSubmitting, handleSubmit: submitForm, handleCancel } = useCardForm({
    initialData: {
      title: card.title,
      description: card.description || "",
      priority: card.priority,
      assignee_id: card.assignee_id,
      due_date: card.due_date ? new Date(card.due_date) : undefined,
      due_time: card.due_time || "",
      background_color: card.background_color || "#FFFFFF"
    },
    onSubmit: handleSubmit,
    onCancel: () => onOpenChange(false)
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
            <CardFormFields form={form} />
            
            <div className={`flex ${isMobile ? "flex-col gap-2" : "justify-end space-x-2"}`}>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                type="button"
                className={isMobile ? "w-full" : ""}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={isMobile ? "w-full" : ""}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
