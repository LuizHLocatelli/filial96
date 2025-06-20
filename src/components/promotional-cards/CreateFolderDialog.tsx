import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FolderPlus } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export function CreateFolderDialog({ 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: CreateFolderDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [folderName, setFolderName] = useState("");
  const [description, setDescription] = useState("");
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
          description: description.trim() || null,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pasta criada com sucesso."
      });
      
      setFolderName("");
      setDescription("");
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
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <FolderPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Nova Pasta
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Crie uma nova pasta para organizar seus cards promocionais
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="folderName">Nome da Pasta *</Label>
            <Input
              id="folderName"
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Digite o nome da pasta"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da pasta (opcional)"
              rows={3}
              className="mt-1 resize-none"
            />
          </div>
        </div>
        
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
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            {isCreating ? "Criando..." : "Criar Pasta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
