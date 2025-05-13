
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { NoteFolder } from './types';
import { useToast } from '@/components/ui/use-toast';

interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (content: string, color: string, folderId: string | null) => Promise<void>;
  folders: NoteFolder[];
}

export function CreateNoteDialog({ isOpen, onClose, onCreateNote, folders }: CreateNoteDialogProps) {
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [color, setColor] = useState(getRandomColor());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const colors = [
    { value: '#FEF7CD', label: 'Amarelo' },
    { value: '#F2FCE2', label: 'Verde' },
    { value: '#E5DEFF', label: 'Roxo' },
    { value: '#FFE9E7', label: 'Vermelho' },
    { value: '#E5F6FF', label: 'Azul' },
  ];

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo da nota não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateNote(content, color, selectedFolder);
      // Reset form
      setContent('');
      setSelectedFolder(null);
      setColor(getRandomColor());
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a nota",
        variant: "destructive"
      });
      console.error("Error creating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Nota</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea 
              id="content"
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Digite o conteúdo da nota"
              className="min-h-[120px]"
              style={{ backgroundColor: color }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === colorOption.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Pasta</Label>
            <Select
              value={selectedFolder || "no-folder"}
              onValueChange={(value) => setSelectedFolder(value === "no-folder" ? null : value)}
            >
              <SelectTrigger id="folder">
                <SelectValue placeholder="Selecione uma pasta (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-folder">Sem pasta</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Nota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getRandomColor() {
  const colors = [
    '#FEF7CD', // amarelo claro
    '#F2FCE2', // verde claro
    '#E5DEFF', // roxo claro
    '#FFE9E7', // vermelho claro
    '#E5F6FF', // azul claro
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
