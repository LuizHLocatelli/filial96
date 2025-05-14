
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CardFormFields, formSchema } from "./form/CardFormFields";
import { useCardForm } from "./form/useCardForm";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export interface AddCardDialogProps {
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
  const isMobile = useIsMobile();
  
  const handleSubmit = async (values: any) => {
    try {
      console.log("Submitting card values:", values);
      console.log("Column ID:", columnId);
      
      await onAddCard({
        title: values.title,
        description: values.description || "",
        priority: values.priority,
        assigneeId: values.assigneeId,
        dueDate: values.dueDate,
        dueTime: values.dueTime,
        backgroundColor: values.backgroundColor
      });
      
      toast({
        description: "Cartão adicionado com sucesso!",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o cartão."
      });
    }
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
        dueTime: "",
        backgroundColor: "#FFFFFF" // Default white background
      });
    }
  }, [open, form]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Adicionar Cartão</DialogTitle>
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
                {isSubmitting ? 'Adicionando...' : 'Adicionar Cartão'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
