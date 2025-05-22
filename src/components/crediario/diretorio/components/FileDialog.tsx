
import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DirectoryFile, DirectoryCategory } from '../types';

interface FileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: {
    name: string;
    description: string;
    category_id: string | null;
    is_featured: boolean;
  }) => Promise<void>;
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
  const [name, setName] = useState(file?.name || '');
  const [description, setDescription] = useState(file?.description || '');
  const [categoryId, setCategoryId] = useState<string>(file?.category_id || 'none'); // Default to 'none'
  const [isFeatured, setIsFeatured] = useState(file?.is_featured || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setDescription(file.description || '');
      setCategoryId(file.category_id || 'none'); // Use 'none' when null
      setIsFeatured(file.is_featured);
    }
  }, [file, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSave({
        name,
        description: description || '',
        category_id: categoryId === 'none' ? null : categoryId,
        is_featured: isFeatured
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Arquivo</DialogTitle>
          <DialogDescription>
            Edite os detalhes do arquivo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do arquivo"
              required
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do arquivo (opcional)"
              rows={3}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
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
            <Label htmlFor="featured">Destacar este arquivo</Label>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
