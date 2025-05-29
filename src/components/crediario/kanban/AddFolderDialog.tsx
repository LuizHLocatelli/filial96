import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateFolderData } from './types';

interface AddFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFolder: (folderData: CreateFolderData) => Promise<void>;
  initialData?: {
    id: string;
    name: string;
  };
}

export function AddFolderDialog({ isOpen, onClose, onAddFolder, initialData }: AddFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFolderName(initialData.name);
    } else {
      setFolderName('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddFolder({ name: folderName.trim() });
      setFolderName('');
    } catch (error) {
      console.error('Error creating/updating folder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = initialData ? "Editar Pasta" : "Nova Pasta";
  const submitButtonText = initialData ? "Salvar" : "Criar";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {initialData ? "Edite o nome da pasta existente" : "Crie uma nova pasta para organizar suas notas"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Pasta</Label>
              <Input
                id="name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Digite o nome da pasta"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!folderName.trim() || isSubmitting}
            >
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
