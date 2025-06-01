import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RotinaFormData } from '../types';
import { X } from 'lucide-react';

interface AddRotinaDialogProps {
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

const diasDaSemana = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

export function AddRotinaDialog({ open, onOpenChange, onSubmit }: AddRotinaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RotinaFormData>({
    nome: '',
    descricao: '',
    periodicidade: 'diario',
    horario_preferencial: '',
    dia_preferencial: '',
    categoria: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Para periodicidade diária, dia preferencial não é obrigatório
    const isDiaPreferencialRequired = formData.periodicidade !== 'diario';
    
    if (!formData.nome.trim() || !formData.categoria.trim() || 
        (isDiaPreferencialRequired && !formData.dia_preferencial.trim())) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await onSubmit({
      ...formData,
      nome: formData.nome.trim(),
      descricao: formData.descricao?.trim() || undefined,
      horario_preferencial: formData.horario_preferencial || undefined,
      // Para periodicidade diária, não enviar dia preferencial
      dia_preferencial: formData.periodicidade === 'diario' ? 'diario' : formData.dia_preferencial,
    });

    if (success) {
      setFormData({
        nome: '',
        descricao: '',
        periodicidade: 'diario',
        horario_preferencial: '',
        dia_preferencial: '',
        categoria: '',
      });
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof RotinaFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Limpar dia preferencial quando mudar para periodicidade diária
      if (field === 'periodicidade' && value === 'diario') {
        newData.dia_preferencial = '';
      }
      
      return newData;
    });
  };

  const clearHorarioPreferencial = () => {
    setFormData(prev => ({ ...prev, horario_preferencial: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Rotina</DialogTitle>
          <DialogDescription>
            Crie uma nova rotina para organizar suas tarefas obrigatórias.
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
              <div className="flex gap-2">
                <Input
                  id="horario"
                  type="time"
                  value={formData.horario_preferencial}
                  onChange={(e) => handleInputChange('horario_preferencial', e.target.value)}
                  className="flex-1"
                />
                {formData.horario_preferencial && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearHorarioPreferencial}
                    className="px-2"
                    title="Limpar horário"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {formData.periodicidade !== 'diario' && (
            <div className="space-y-2">
              <Label htmlFor="dia_preferencial">Dia Preferencial *</Label>
              <Select
                value={formData.dia_preferencial}
                onValueChange={(value) => handleInputChange('dia_preferencial', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um dia" />
                </SelectTrigger>
                <SelectContent>
                  {diasDaSemana.map(dia => (
                    <SelectItem key={dia.value} value={dia.value}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              {isSubmitting ? 'Criando...' : 'Criar Rotina'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
