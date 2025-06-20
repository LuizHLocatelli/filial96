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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileEdit } from 'lucide-react';
import { DirectoryFile, DirectoryCategory } from '../types';
import { useMobileDialog } from '@/hooks/useMobileDialog';

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
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
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
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <FileEdit className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Editar Arquivo
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Altere as informações do arquivo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
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
                  <SelectItem value="">Sem categoria</SelectItem>
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
              value={description}
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
        </div>
        
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
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
