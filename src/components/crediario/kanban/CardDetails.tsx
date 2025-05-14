
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { CardFormFields, FormValues } from "./form/CardFormFields";
import { TaskCard } from "./types";
import { useCardForm } from "./form/useCardForm";
import { CardComments } from "./CardComments";
import { useState } from "react";
import { useCardActions } from "./hooks/useCardActions"; 
import { useKanbanBoard } from "./useKanbanBoard";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getTextColor } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CardDetailsProps {
  card: TaskCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetails({ card, open, onOpenChange }: CardDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { cards, setCards } = useKanbanBoard();
  const { updateCard, deleteCard } = useCardActions(cards, setCards);
  const isMobile = useIsMobile();
  
  // Handle form submission for editing the card
  const handleSubmit = async (values: FormValues) => {
    await updateCard(card.id, {
      title: values.title,
      description: values.description || "",
      priority: values.priority as 'baixa' | 'media' | 'alta',
      assignee_id: values.assigneeId,
      due_date: values.dueDate?.toISOString(),
      due_time: values.dueTime,
      background_color: values.backgroundColor
    });
  };
  
  const { form, isSubmitting, handleSubmit: submitForm, handleCancel } = useCardForm({
    initialData: card,
    onSubmit: handleSubmit,
    onCancel: () => onOpenChange(false)
  });
  
  // Handle card deletion
  const handleDelete = async () => {
    await deleteCard(card.id);
    onOpenChange(false);
  };

  // Determine text color based on card background
  const headerStyle = card.background_color ? {
    backgroundColor: card.background_color,
    color: getTextColor(card.background_color)
  } : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[700px] p-0 overflow-hidden max-h-[90vh] w-[calc(100%-2rem)]"
      >
        <DialogHeader className="p-4 sm:p-6" style={headerStyle}>
          <DialogTitle className="text-lg sm:text-xl">{card.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 sm:px-6">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">Comentários</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="p-4 sm:p-6 space-y-4 sm:space-y-6 pt-2 overflow-y-auto max-h-[60vh]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
                <CardFormFields form={form} />
                
                <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'} pt-2`}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size={isMobile ? "default" : "sm"} type="button" className={isMobile ? "w-full" : ""}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[calc(100%-2rem)]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir cartão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Tem certeza que deseja excluir este cartão?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                        <AlertDialogCancel className={isMobile ? "w-full mt-0" : ""}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          className={`bg-destructive hover:bg-destructive/90 ${isMobile ? "w-full" : ""}`}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <div className={`flex ${isMobile ? "flex-col w-full" : "space-x-2"}`}>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel} 
                      type="button"
                      className={isMobile ? "w-full mb-2" : ""}
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
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="comments" className="p-4 sm:p-6 pt-2 overflow-y-auto max-h-[60vh]">
            <CardComments cardId={card.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
