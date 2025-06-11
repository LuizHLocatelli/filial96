import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useFolders } from "@/hooks/useFolders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CardEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  title: string;
  folderId: string | null;
  sector: "furniture" | "fashion" | "loan" | "service";
  isMobile?: boolean;
  onSuccess?: () => void;
}

export function CardEditDialog({ 
  isOpen, 
  onOpenChange, 
  id, 
  title,
  folderId,
  sector,
  isMobile,
  onSuccess
}: CardEditDialogProps) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderId);
  const [isLoading, setIsLoading] = useState(false);
  const { folders, isLoading: isLoadingFolders } = useFolders(sector);

  useEffect(() => {
    if (isOpen) {
      setEditedTitle(title);
      setSelectedFolderId(folderId);
    }
  }, [isOpen, title, folderId]);

  const handleUpdateCard = async () => {
    if (!editedTitle.trim()) {
      toast({
        title: "Erro",
        description: "O título não pode ficar vazio",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('promotional_cards')
        .update({ 
          title: editedTitle.trim(),
          folder_id: selectedFolderId 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Card atualizado com sucesso"
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o card",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Editar Card</DialogTitle>
          <DialogDescription>
            Altere as informações do card promocional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateCard();
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-title" className="text-xs sm:text-sm">Título</Label>
            <Input
              id="card-title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Digite o título do card"
              disabled={isLoading}
              className="text-xs sm:text-sm h-8 sm:h-10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="folder-select" className="text-xs sm:text-sm">Mover para Pasta</Label>
            <Select
              value={selectedFolderId || 'none'}
              onValueChange={(value) => setSelectedFolderId(value === 'none' ? null : value)}
              disabled={isLoading || isLoadingFolders}
            >
              <SelectTrigger id="folder-select" className="text-xs sm:text-sm h-8 sm:h-10">
                <SelectValue placeholder="Selecione uma pasta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma pasta</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !editedTitle.trim()}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
