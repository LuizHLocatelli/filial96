import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Folder {
  id: string;
  name: string;
  // Adicione outros campos se necessário, como sector_id, user_id, etc.
}

interface EditFolderDialogProps {
  folder: Folder | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void; // Callback para quando a atualização for bem-sucedida
}

export function EditFolderDialog({ folder, isOpen, onOpenChange, onSuccess }: EditFolderDialogProps) {
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    } else {
      setName(""); // Reseta o nome se nenhuma pasta for fornecida (ex: ao fechar e reabrir)
    }
  }, [folder]);

  const handleUpdateFolder = async () => {
    if (!folder || !name.trim()) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('card_folders')
        .update({ name: name.trim() })
        .eq('id', folder.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pasta atualizada com sucesso."
      });
      
      onOpenChange(false); // Fecha o diálogo
      if (onSuccess) {
        onSuccess(); // Chama o callback de sucesso, se fornecido
      }
    } catch (error) {
      console.error('Error updating folder:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a pasta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Garante que o diálogo não renderize conteúdo se não houver pasta (ou resetar estado interno)
  if (!folder) {
      return null; 
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) { // Se estiver fechando, reseta o nome
        setName(folder?.name || ""); 
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Pasta</DialogTitle>
          <DialogDescription>
            Altere o nome da pasta para organizar melhor seus cards promocionais
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folder-name-edit" className="text-right">
              Nome
            </Label>
            <Input
              id="folder-name-edit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateFolder} 
            disabled={isProcessing || !name.trim()}
          >
            {isProcessing ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 