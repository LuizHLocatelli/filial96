import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus, Edit3 } from 'lucide-react';
import { DirectoryCategory } from '../types';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string) => void;
  title: string;
  category?: DirectoryCategory;
}

export function CategoryDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  title, 
  category 
}: CategoryDialogProps) {
  const isMobile = useIsMobile();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [category, open]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      onOpenChange(false);
      if (!category) {
        setName('');
        setDescription('');
      }
    }
  };

  const isEditing = !!category;
  const IconComponent = isEditing ? Edit3 : FolderPlus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={IconComponent}
          iconColor="primary"
          title={title}
          description={category ? 'Edite os dados da categoria.' : 'Crie uma nova categoria para organizar seus arquivos.'}
          onClose={() => onOpenChange(false)}
          loading={false}
        />
        
        <StandardDialogContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome da categoria"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da categoria (opcional)"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </StandardDialogContent>
        
        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim()}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {isEditing ? 'Atualizar' : 'Criar Categoria'}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
