
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TaskCard } from "./types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle,
  Trash, 
  Edit, 
  MoveHorizontal
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUsers } from "./useUsers";
import { useState } from "react";
import { EditCardDialog } from "./EditCardDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CardComments } from "./CardComments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CardDetailsProps {
  card: TaskCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<TaskCard>) => void;
  onMoveCard?: (cardId: string, targetColumnId: string) => void;
}

export function CardDetails({ 
  card, 
  open, 
  onOpenChange, 
  onDelete,
  onUpdate,
  onMoveCard
}: CardDetailsProps) {
  const isMobile = useIsMobile();
  const { usersData } = useUsers();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  const assignee = card.assignee_id 
    ? usersData.find(user => user.id === card.assignee_id) 
    : null;
  
  // Calculate if task is overdue
  const isOverdue = () => {
    if (!card.due_date) return false;
    return new Date(card.due_date) < new Date();
  };
  
  // Format dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  // Define priority badge style
  const getPriorityBadgeStyle = () => {
    switch (card.priority) {
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-900";
      case "media":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-900";
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-900";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
    onOpenChange(false);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold">{card.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("font-medium", getPriorityBadgeStyle())}>
                {card.priority === "baixa" ? "Baixa" : card.priority === "media" ? "Média" : "Alta"}
              </Badge>
              
              {isOverdue() && (
                <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-900 gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Atrasada</span>
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="comments">Comentários</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              {/* Due date and time info */}
              {(card.due_date || card.due_time) && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-sm font-medium">Prazo</h4>
                  <div className="flex flex-wrap gap-3">
                    {card.due_date && (
                      <div className={cn(
                        "flex items-center gap-2 text-sm rounded-md border px-2.5 py-1",
                        isOverdue() ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400" : "border-gray-200 dark:border-gray-700"
                      )}>
                        <Calendar className={cn("h-4 w-4", isOverdue() ? "text-red-500" : "")} />
                        <span>{formatDate(card.due_date)}</span>
                      </div>
                    )}
                    
                    {card.due_time && (
                      <div className="flex items-center gap-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1">
                        <Clock className="h-4 w-4" />
                        <span>{card.due_time}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Assignee */}
              {assignee && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-sm font-medium">Responsável</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignee.avatar_url || ""} alt={assignee.name} />
                      <AvatarFallback className="text-[10px] bg-primary/10">
                        {assignee.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{assignee.name}</span>
                  </div>
                </div>
              )}
              
              {/* Description */}
              {card.description && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Descrição</span>
                  </h4>
                  <div className="text-sm bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                    <p className="whitespace-pre-wrap">{card.description}</p>
                  </div>
                </div>
              )}
              
              {/* Created info */}
              <div className="flex flex-col gap-1.5">
                <h4 className="text-sm font-medium">Histórico</h4>
                <p className="text-xs text-muted-foreground">
                  Criado em {formatDate(card.created_at)}
                  {card.updated_at && card.updated_at !== card.created_at && (
                    <>
                      <br />
                      Atualizado em {formatDate(card.updated_at)}
                    </>
                  )}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="comments">
              <CardComments cardId={card.id} />
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className={`flex ${isMobile ? "flex-col gap-2" : "justify-between items-center"}`}>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-500 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-1"
              >
                <Trash className="h-4 w-4" />
                <span>Excluir</span>
              </Button>
            </div>
            
            {onMoveCard && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <MoveHorizontal className="h-4 w-4" />
                    <span>Mover</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Columns will be added dynamically */}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className={isMobile ? "w-full" : ""}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EditCardDialog 
        card={card}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={onUpdate}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
