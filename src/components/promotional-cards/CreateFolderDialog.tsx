
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FolderPlus } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

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
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
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
      <DialogContent {...getMobileDialogProps("default")}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <FolderPlus className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                Nova Pasta
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              Crie uma nova pasta para organizar seus cards promocionais
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <div className="space-y-4 md:space-y-6">
            <div>
              <Label htmlFor="folderName" className="text-sm md:text-base">Nome da Pasta *</Label>
              <Input
                id="folderName"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Digite o nome da pasta"
                required
                className="mt-1 h-9 md:h-10 text-xs md:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div {...getMobileFooterProps()}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={isCreating || !folderName.trim()}
            variant="success"
          >
            <FolderPlus className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            {isCreating ? "Criando..." : "Criar Pasta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
