import { useState, useEffect } from "react";
import { Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'}
          max-h-[85vh] overflow-y-auto flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Edit3}
          iconColor="primary"
          title="Editar Pasta"
          description="Altere o nome da pasta para organizar melhor seus cards promocionais"
          onClose={() => onOpenChange(false)}
          loading={isProcessing}
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name-edit" className="text-base">Nome da Pasta *</Label>
              <Input
                id="folder-name-edit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome da pasta..."
                autoFocus
                className="h-12"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
        
        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isProcessing}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateFolder} 
            disabled={isProcessing || !name.trim()}
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
