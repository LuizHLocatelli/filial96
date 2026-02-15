import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
  onSuccess?: () => void;
}

export function CreateFolderDialog({ 
  isOpen, 
  onOpenChange, 
  sector,
  onSuccess 
}: CreateFolderDialogProps) {
  const isMobile = useIsMobile();
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a pasta.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('card_folders')
        .insert({
          name: folderName.trim(),
          sector: sector,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pasta criada com sucesso."
      });
      
      setFolderName("");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Erro ao criar pasta",
        description: "Não foi possível criar a pasta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'}
          max-h-[85vh] overflow-y-auto flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={FolderPlus}
          iconColor="primary"
          title="Nova Pasta"
          description="Crie uma nova pasta para organizar seus cards promocionais"
          onClose={() => onOpenChange(false)}
          loading={isCreating}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName" className="text-base">Nome da Pasta *</Label>
              <Input
                id="folderName"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Digite o nome da pasta"
                required
                className="mt-1 h-12"
                disabled={isCreating}
              />
            </div>
          </div>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={isCreating || !folderName.trim()}
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <FolderPlus className="h-4 w-4" />
                Criar Pasta
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
