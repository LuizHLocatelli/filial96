import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, Loader2 } from "@/components/ui/emoji-icons";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { useIsMobile } from "@/hooks/use-mobile";
import { PastaGerencial } from "../types";

interface EditFolderDialogProps {
  pasta: PastaGerencial | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, nome: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditFolderDialog({ pasta, isOpen, onOpenChange, onSubmit, isLoading }: EditFolderDialogProps) {
  const isMobile = useIsMobile();
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (pasta) {
      setNome(pasta.nome);
    }
  }, [pasta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !pasta) return;
    
    await onSubmit(pasta.id, nome.trim());
  };

  const handleClose = () => {
    setNome("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'}
          max-h-[75dvh] sm:max-h-[75vh] overflow-y-auto flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Edit3}
          iconColor="primary"
          title="Renomear Pasta"
          onClose={handleClose}
          loading={isLoading}
        />
        
        <DialogScrollableContainer>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="folder-name-edit" className="text-base">Nome da Pasta</Label>
              <Input
                id="folder-name-edit"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome da pasta"
                disabled={isLoading}
                className="h-12 mt-1"
                autoFocus
              />
            </div>
          </form>
        </DialogScrollableContainer>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !nome.trim()}
            onClick={handleSubmit}
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
