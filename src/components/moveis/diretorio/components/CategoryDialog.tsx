import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus, Edit3 } from 'lucide-react';
import { DirectoryCategory } from '../types';
import { useMobileDialog } from '@/hooks/useMobileDialog';

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
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
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
      <DialogContent {...getMobileDialogProps("default")}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                {title}
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              {category ? 'Edite os dados da categoria.' : 'Crie uma nova categoria para organizar seus arquivos.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
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
        </div>

        {/* Fixed Footer */}
        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            variant="success"
          >
            {isEditing ? 'Atualizar' : 'Criar Categoria'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
