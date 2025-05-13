
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CardFormFields, formSchema } from "./form/CardFormFields";
import { useCardForm } from "./form/useCardForm";
import { useEffect } from "react";

interface AddCardDialogProps {
  columnId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (data: any) => Promise<void>;
}

export function AddCardDialog({ 
  columnId, 
  open, 
  onOpenChange, 
  onAddCard 
}: AddCardDialogProps) {
  
  const handleSubmit = async (values: any) => {
    await onAddCard({
      title: values.title,
      description: values.description || "",
      column_id: columnId,
      priority: values.priority,
      assignee_id: values.assigneeId,
      due_date: values.dueDate?.toISOString(),
      background_color: values.backgroundColor // Include the background color
    });
    
    onOpenChange(false);
  };
  
  const { form, isSubmitting, handleSubmit: submitForm, handleCancel } = useCardForm({
    onSubmit: handleSubmit,
    onCancel: () => onOpenChange(false)
  });
  
  // Reset the form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        priority: "media",
        assigneeId: undefined,
        dueDate: undefined,
        backgroundColor: "#FFFFFF" // Default white background
      });
    }
  }, [open, form]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Cartão</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
            <CardFormFields form={form} />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel} type="button">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar Cartão'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
