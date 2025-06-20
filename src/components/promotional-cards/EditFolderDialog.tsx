import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit3 } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

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
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
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
      <DialogContent {...getMobileDialogProps("small")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Edit3 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Editar Pasta
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Altere o nome da pasta para organizar melhor seus cards promocionais
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="folder-name-edit">Nome da Pasta *</Label>
            <Input
              id="folder-name-edit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da pasta..."
              autoFocus
            />
          </div>
        </div>
        
        <div {...getMobileFooterProps()}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isProcessing}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateFolder} 
            disabled={isProcessing || !name.trim()}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {isProcessing ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 