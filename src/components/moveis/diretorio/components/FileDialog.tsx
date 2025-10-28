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
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <FileEdit className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                Editar Arquivo
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              Altere as informações do arquivo.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
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
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
