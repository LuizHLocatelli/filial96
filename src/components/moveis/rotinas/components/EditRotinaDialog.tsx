
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RotinaFormData, RotinaWithStatus } from '../types';

interface EditRotinaDialogProps {
  rotina: RotinaWithStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RotinaFormData) => Promise<boolean>;
}

const categoriasPredefinidas = [
  'Limpeza',
  'Organização',
  'Manutenção',
  'Administrativo',
  'Vendas',
  'Atendimento',
  'Estoque',
  'Outros'
];

export function EditRotinaDialog({ rotina, open, onOpenChange, onSubmit }: EditRotinaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RotinaFormData>({
    nome: '',
    descricao: '',
    periodicidade: 'diario',
    horario_preferencial: '',
    categoria: '',
  });

  useEffect(() => {
    if (rotina) {
      setFormData({
        nome: rotina.nome,
        descricao: rotina.descricao || '',
        periodicidade: rotina.periodicidade,
        horario_preferencial: rotina.horario_preferencial || '',
        categoria: rotina.categoria,
      });
    }
  }, [rotina]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.categoria.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await onSubmit({
      ...formData,
      nome: formData.nome.trim(),
      descricao: formData.descricao?.trim() || undefined,
      horario_preferencial: formData.horario_preferencial || undefined,
    });

    if (success) {
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof RotinaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Rotina</DialogTitle>
          <DialogDescription>
            Edite as informações da rotina selecionada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Rotina *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Ex: Limpeza do balcão"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descrição opcional da rotina..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodicidade">Periodicidade *</Label>
              <Select
                value={formData.periodicidade}
                onValueChange={(value) => handleInputChange('periodicidade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">Horário Preferencial</Label>
              <Input
                id="horario"
                type="time"
                value={formData.horario_preferencial}
                onChange={(e) => handleInputChange('horario_preferencial', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => handleInputChange('categoria', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriasPredefinidas.map(categoria => (
                  <SelectItem key={categoria} value={categoria.toLowerCase()}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
