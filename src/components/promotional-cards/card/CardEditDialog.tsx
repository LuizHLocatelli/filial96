import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface CardEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  title: string;
  isMobile?: boolean;
  onSuccess?: (newTitle: string) => void;
}

export function CardEditDialog({ 
  isOpen, 
  onOpenChange, 
  id, 
  title,
  isMobile,
  onSuccess
}: CardEditDialogProps) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateTitle = async () => {
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
        .update({ title: editedTitle.trim() })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Título atualizado com sucesso"
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess(editedTitle.trim());
    } catch (error) {
      console.error('Error updating card title:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6 dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Editar Card</DialogTitle>
          <DialogDescription>
            Altere o título do card promocional
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateTitle();
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
