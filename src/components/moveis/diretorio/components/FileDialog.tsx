
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DirectoryFile, DirectoryCategory } from '../types';

interface FileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: {
    name: string;
    description: string;
    category_id: string | null;
    is_featured: boolean;
  }) => void;
  file: DirectoryFile;
  categories: DirectoryCategory[];
}

export function FileDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  file, 
  categories 
}: FileDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setDescription(file.description || '');
      setCategoryId(file.category_id || '');
      setIsFeatured(file.is_featured);
    }
  }, [file, open]);

  const handleSave = () => {
    onSave({
      name: name.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      is_featured: isFeatured,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Arquivo</DialogTitle>
          <DialogDescription>
            Altere as informações do arquivo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do arquivo"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do arquivo (opcional)"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <Label htmlFor="featured">Destacar arquivo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
