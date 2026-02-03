import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileEdit } from 'lucide-react';
import { DirectoryFile, DirectoryCategory } from '../types';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

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
  const isMobile = useIsMobile();
  const [name, setName] = useState(file?.name || '');
  const [description, setDescription] = useState(file?.description || '');
  const [categoryId, setCategoryId] = useState<string>(file?.category_id || 'none');
  const [isFeatured, setIsFeatured] = useState(file?.is_featured || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setDescription(file.description || '');
      setCategoryId(file.category_id || 'none');
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
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[600px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={FileEdit}
          iconColor="primary"
          title="Editar Arquivo"
          description="Edite os detalhes do arquivo."
          onClose={() => onOpenChange(false)}
          loading={isSubmitting}
        />
        
        <StandardDialogContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nome do Arquivo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite o nome do arquivo"
                  required
                />
              </div>
              
              <div>
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
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do arquivo (opcional)"
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <div>
                <Label htmlFor="featured" className="cursor-pointer font-medium">
                  Destacar arquivo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Arquivos destacados aparecem em evidência na listagem
                </p>
              </div>
            </div>
          </form>
        </StandardDialogContent>
        
        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
