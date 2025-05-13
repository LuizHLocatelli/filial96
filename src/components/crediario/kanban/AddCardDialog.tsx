
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
} from "@/components/ui/form";
import { CardFormFields, FormValues } from "./form/CardFormFields";
import { CardDueDateField } from "./form/CardDueDateField";
import { useCardForm } from "./form/useCardForm";

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (data: FormValues) => void;
}

export function AddCardDialog({ open, onOpenChange, onAddCard }: AddCardDialogProps) {
  const { form, resetForm } = useCardForm();
  
  const onSubmit = (data: FormValues) => {
    onAddCard(data);
    resetForm();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Cartão</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardFormFields form={form} />
            <CardDueDateField form={form} />
            
            <DialogFooter>
              <Button type="submit">Criar cartão</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
