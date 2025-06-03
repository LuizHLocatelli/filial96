import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModaFolgas } from '../useModaFolgas';
import { Folga } from '../types';

interface FolgasFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: {
    data: Date;
    consultorId: string;
    motivo?: string;
  }) => Promise<void>;
  editingFolga?: Folga | null;
}

export function FolgasForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingFolga 
}: FolgasFormProps) {
  const { consultores } = useModaFolgas();
  const [formData, setFormData] = useState({
    data: new Date(),
    consultorId: '',
    motivo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preencher formulário quando está editando
  useEffect(() => {
    if (editingFolga) {
      setFormData({
        data: new Date(editingFolga.data),
        consultorId: editingFolga.consultorId,
        motivo: editingFolga.motivo || ''
      });
    } else {
      setFormData({
        data: new Date(),
        consultorId: '',
        motivo: ''
      });
    }
  }, [editingFolga]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consultorId) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        data: formData.data,
        consultorId: formData.consultorId,
        motivo: formData.motivo || undefined
      });
      
      // Reset form
      setFormData({
        data: new Date(),
        consultorId: '',
        motivo: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar folga:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">
            {editingFolga ? 'Editar Folga' : 'Nova Folga'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Data */}
            <div>
              <Label className="text-sm font-medium">Data da Folga *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.data, 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, data: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Consultor */}
            <div>
              <Label className="text-sm font-medium">Consultor *</Label>
              <Select 
                value={formData.consultorId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, consultorId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um consultor" />
                </SelectTrigger>
                <SelectContent>
                  {consultores.map((consultor) => (
                    <SelectItem key={consultor.id} value={consultor.id}>
                      {consultor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Motivo */}
            <div>
              <Label htmlFor="motivo" className="text-sm font-medium">
                Motivo (opcional)
              </Label>
              <Textarea
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                placeholder="Descreva o motivo da folga..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.consultorId}
              >
                {isSubmitting ? 'Salvando...' : editingFolga ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 