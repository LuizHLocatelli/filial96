
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCardForm } from "./form/useCardForm";
import { CardFormFields } from "./form/CardFormFields";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskCard } from "./types";

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (data: any) => void;
  editMode?: boolean;
  initialData?: TaskCard;
}

export function AddCardDialog({ 
  open, 
  onOpenChange, 
  onAddCard,
  editMode = false,
  initialData
}: AddCardDialogProps) {
  const { form, handleSubmit, isSubmitting } = useCardForm(initialData);
  const [isProcessing, setIsProcessing] = useState(false);

  const saveCard = async (formData: any) => {
    try {
      setIsProcessing(true);

      if (editMode && initialData?.id) {
        // Update existing card
        const { error } = await supabase
          .from('crediario_kanban_cards')
          .update({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            assignee_id: formData.assigneeId,
            due_date: formData.dueDate ? formData.dueDate.toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialData.id);
        
        if (error) throw error;
        
      } else {
        // Use the existing function for creating new card
        onAddCard(formData);
      }
      
      onOpenChange(false);
      
      if (editMode) {
        toast.success("Cartão atualizado com sucesso");
      }
      
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error(editMode ? "Erro ao atualizar o cartão" : "Erro ao adicionar cartão");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Editar Cartão' : 'Adicionar Novo Cartão'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(saveCard)} className="space-y-4 mt-4">
          <CardFormFields form={form} />
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing}
            >
              {isProcessing ? (editMode ? 'Atualizando...' : 'Adicionando...') : (editMode ? 'Atualizar' : 'Adicionar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
