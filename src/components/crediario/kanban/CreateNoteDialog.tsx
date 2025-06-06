
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { NoteFolder } from './types';
import { useToast } from '@/components/ui/use-toast';
import { useMobileDialog } from '@/hooks/useMobileDialog';

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
  const { getMobileDialogProps, getMobileButtonProps, getMobileFormProps } = useMobileDialog();

  const colors = [
    { value: '#FEF7CD', label: 'Amarelo', textColor: '#5B4D00' },
    { value: '#F2FCE2', label: 'Verde', textColor: '#1A4D00' },
    { value: '#E5DEFF', label: 'Roxo', textColor: '#4A1D95' },
    { value: '#FFE9E7', label: 'Vermelho', textColor: '#7A1100' },
    { value: '#E5F6FF', label: 'Azul', textColor: '#004A77' },
    { value: '#FEC6A1', label: 'Laranja', textColor: '#803400' },
    { value: '#FFDEE2', label: 'Rosa', textColor: '#9C1C36' },
    { value: '#FDE1D3', label: 'Pêssego', textColor: '#7A3A19' },
    { value: '#D3E4FD', label: 'Azul Claro', textColor: '#002A66' },
    { value: '#F1F0FB', label: 'Cinza', textColor: '#303030' },
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
      console.error("Erro ao criar nota:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determina a cor do texto com base na cor de fundo para garantir contraste
  const getTextColor = () => {
    const colorOption = colors.find(c => c.value === color);
    return colorOption ? colorOption.textColor : '#000000';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent {...getMobileDialogProps("md")} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Nova Nota</DialogTitle>
          <DialogDescription className="text-sm">
            Crie uma nova nota para o quadro Kanban com conteúdo personalizado
          </DialogDescription>
        </DialogHeader>
        
        <div {...getMobileFormProps()} className="py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">Conteúdo</Label>
            <Textarea 
              id="content"
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Digite o conteúdo da nota"
              className="min-h-[120px] text-base sm:text-sm resize-none"
              style={{ 
                backgroundColor: color, 
                color: getTextColor() 
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-medium">Cor</Label>
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
            <Label htmlFor="folder" className="text-sm font-medium">Pasta</Label>
            <Select
              value={selectedFolder || "no-folder"}
              onValueChange={(value) => setSelectedFolder(value === "no-folder" ? null : value)}
            >
              <SelectTrigger id="folder" className="text-base sm:text-sm">
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            {...getMobileButtonProps()}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            {...getMobileButtonProps()}
          >
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
    '#FEC6A1', // laranja claro
    '#FFDEE2', // rosa claro
    '#FDE1D3', // pêssego claro
    '#D3E4FD', // azul claro alternativo
    '#F1F0FB', // cinza claro
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
