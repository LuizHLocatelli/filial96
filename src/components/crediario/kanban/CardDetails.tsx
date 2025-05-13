
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Tag,
  MessageSquare,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUsers } from "./useUsers";
import { TaskCard } from "./types";
import { useState } from "react";
import { CardComments } from "./CardComments";
import { toast } from "sonner";
import { PriorityBadge } from "./components/PriorityBadge";
import { supabase } from "@/integrations/supabase/client";
import { AddCardDialog } from "./AddCardDialog";

interface CardDetailsProps {
  card: TaskCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetails({ card, open, onOpenChange }: CardDetailsProps) {
  const { usersData } = useUsers();
  const [showComments, setShowComments] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const assignee = card.assignee_id 
    ? usersData.find(user => user.id === card.assignee_id) 
    : null;

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async () => {
    try {
      setIsDeleting(true);
      
      // Delete card from database
      const { error } = await supabase
        .from('crediario_kanban_cards')
        .delete()
        .eq('id', card.id);
      
      if (error) throw error;
      
      // Close the dialog after successful deletion
      onOpenChange(false);
      
      // Show success message
      toast.success("Cartão excluído com sucesso");
      
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error("Erro ao excluir o cartão");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle card update after edit
  const handleCardUpdate = () => {
    setIsEditDialogOpen(false);
    onOpenChange(false); // Close details dialog after successful edit
    toast.success("Cartão atualizado com sucesso");
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl pr-8">{card.title}</DialogTitle>
              <PriorityBadge priority={card.priority} />
            </div>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            {/* Meta informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {assignee && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Responsável: <span className="font-medium">{assignee.name}</span></span>
                </div>
              )}
              
              {card.due_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Vencimento: <span className="font-medium">
                    {format(new Date(card.due_date), "Pp", { locale: ptBR })}
                  </span></span>
                </div>
              )}
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Criado: <span className="font-medium">
                  {formatDistanceToNow(new Date(card.created_at), { addSuffix: true, locale: ptBR })}
                </span></span>
              </div>
            </div>
            
            <Separator />
            
            {/* Descrição */}
            <div>
              <h3 className="text-sm font-medium mb-1">Descrição</h3>
              <div className="text-sm bg-secondary/20 rounded-md p-3 min-h-[60px]">
                {card.description || <span className="text-muted-foreground italic">Sem descrição</span>}
              </div>
            </div>
            
            {/* Tags - a ser implementado quando tivermos as tags */}
            <div>
              <h3 className="text-sm font-medium mb-1">Etiquetas</h3>
              <div className="flex flex-wrap gap-1">
                <span className="text-muted-foreground italic text-sm">Nenhuma etiqueta atribuída</span>
                {/* Aqui entrariam as tags */}
              </div>
            </div>
            
            <Separator />
            
            {/* Comentários */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Comentários</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {showComments ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
              
              {showComments && <CardComments cardId={card.id} />}
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditClick}
                disabled={isDeleting}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddCardDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onAddCard={handleCardUpdate}
        editMode={true}
        initialData={card}
      />
    </>
  );
}
