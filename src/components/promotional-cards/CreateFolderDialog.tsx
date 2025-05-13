
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion";
}

export function CreateFolderDialog({ open, onOpenChange, sector }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da pasta não pode ficar vazio",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar uma pasta",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('card_folders')
        .insert([
          { 
            name: folderName.trim(), 
            sector,
            created_by: user.id
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Pasta criada com sucesso"
      });
      
      setFolderName("");
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a pasta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFolderName("");
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Nova Pasta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name" className="text-xs sm:text-sm">Nome da pasta</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Digite o nome da pasta"
              disabled={isSubmitting}
              className="text-xs sm:text-sm h-8 sm:h-10"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !folderName.trim()}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Pasta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
