
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, Edit3, Trash2, Image } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CardViewDialog } from "./CardViewDialog";
import { CardEditDialog } from "./CardEditDialog";
import { CardDeleteDialog } from "./CardDeleteDialog";

interface PromotionalCardProps {
  id: string;
  title: string;
  code?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  imageUrl: string;
  folderId: string | null;
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, folderId: string | null) => Promise<boolean>;
  onUpdate: (id: string, updates: { title: string }) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
  isMobile?: boolean;
}

export function PromotionalCard({ 
  id,
  title,
  code,
  startDate,
  endDate,
  imageUrl,
  folderId,
  onDelete,
  onMoveToFolder,
  onUpdate,
  sector,
  isMobile
}: PromotionalCardProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  const formatDateForDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(code || '')
      .then(() => {
        toast({
          title: "Copiado!",
          description: "Código copiado para a área de transferência.",
        });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Erro",
          description: "Falha ao copiar o código.",
          variant: "destructive"
        });
      });
  };

  const handleDeleteCard = async () => {
    setIsDeletingCard(true);
    try {
      await onDelete(id);
      toast({
        title: "Sucesso",
        description: "Card excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir o card.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingCard(false);
    }
  };

  return (
    <>
      <Card className="w-full relative group">
        <div className="aspect-video relative overflow-hidden rounded-md">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            width={500}
            height={300}
            style={{ objectFit: "cover" }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 touch-friendly"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>
              <Image className="mr-2 h-4 w-4" />
              <span>Visualizar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copiar Código</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit3 className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dialogs */}
        <CardViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          title={title}
          imageUrl={imageUrl}
          code={code || ''}
          startDate={startDate ? formatDateForDisplay(startDate) : ''}
          endDate={endDate ? formatDateForDisplay(endDate) : ''}
          currentFolder={{
            id: folderId || '',
            name: 'Pasta Principal'
          }}
          isMobile={isMobile || false}
        />

        <CardEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          id={id}
          title={title}
          isMobile={isMobile || false}
          onSuccess={(newTitle) => onUpdate(id, { title: newTitle })}
        />

        <CardDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteCard}
          isLoading={isDeletingCard}
          isMobile={isMobile || false}
        />
      </Card>
    </>
  );
}
