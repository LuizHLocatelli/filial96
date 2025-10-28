
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Edit3, Calendar, Users, Target } from 'lucide-react';
import { RotinaFormData, RotinaWithStatus } from '../types';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface EditRotinaDialogProps {
  rotina: RotinaWithStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RotinaFormData) => Promise<boolean>;
  isSubmitting: boolean;
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

export function EditRotinaDialog({ rotina, open, onOpenChange, onSubmit, isSubmitting }: EditRotinaDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [formData, setFormData] = useState<RotinaFormData>({
    nome: '',
    descricao: '',
    periodicidade: 'diario',
    horario_preferencial: '',
    dia_preferencial: '',
    categoria: '',
  });

  useEffect(() => {
    if (rotina) {
      setFormData({
        nome: rotina.nome,
        descricao: rotina.descricao || '',
        periodicidade: rotina.periodicidade,
        horario_preferencial: rotina.horario_preferencial || '',
        dia_preferencial: rotina.dia_preferencial || '',
        categoria: rotina.categoria,
      });
    }
  }, [rotina]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 EditRotinaDialog - handleSubmit chamado:', { formData });
    
    // Para periodicidade diária, dia preferencial não é obrigatório
    const isDiaPreferencialRequired = formData.periodicidade !== 'diario';
    
    if (!formData.nome.trim() || !formData.categoria.trim() || 
        (isDiaPreferencialRequired && !formData.dia_preferencial.trim())) {
      console.log('❌ Validação falhou:', {
        nome: formData.nome.trim(),
        categoria: formData.categoria.trim(),
        dia_preferencial: formData.dia_preferencial.trim(),
        isDiaPreferencialRequired
      });
      return;
    }
    
    const dataToSubmit = {
      ...formData,
      nome: formData.nome.trim(),
      descricao: formData.descricao?.trim() || undefined,
      horario_preferencial: formData.horario_preferencial || undefined,
      // Para periodicidade diária, não enviar dia preferencial
      dia_preferencial: formData.periodicidade === 'diario' ? 'diario' : formData.dia_preferencial,
    };
    
    console.log('📡 Enviando dados:', dataToSubmit);
    
    const success = await onSubmit(dataToSubmit);
    
    console.log('📋 Resultado:', { success });

    if (success) {
      onOpenChange(false);
    }
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
      <DialogContent {...getMobileDialogProps("default")}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <Edit3 className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                Editar Rotina
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              Modifique os dados da rotina existente
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
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
          </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="success"
          >
            <Edit3 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
