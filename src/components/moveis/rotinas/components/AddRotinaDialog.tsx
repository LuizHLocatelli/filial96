import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotinaFormData } from '../types';
import { X, Zap, Calendar, Plus } from 'lucide-react';
import { useMobileDialog } from '@/hooks/useMobileDialog';

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
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RotinaFormData>({
    nome: '',
    descricao: '',
    periodicidade: 'diario',
    horario_preferencial: '',
    dia_preferencial: '',
    categoria: '',
    gera_tarefa_automatica: false,
    template_tarefa: {
      titulo: '',
      descricao: '',
      prazo_dias: 3
    }
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
    
    const submitData: RotinaFormData = {
      ...formData,
      nome: formData.nome.trim(),
      descricao: formData.descricao?.trim() || undefined,
      horario_preferencial: formData.horario_preferencial || undefined,
      // Para periodicidade diária, não enviar dia preferencial
      dia_preferencial: formData.periodicidade === 'diario' ? 'diario' : formData.dia_preferencial,
    };

    // Se não gera tarefa automática, remover template
    if (!formData.gera_tarefa_automatica) {
      delete submitData.template_tarefa;
    }

    const success = await onSubmit(submitData);

    if (success) {
      setFormData({
        nome: '',
        descricao: '',
        periodicidade: 'diario',
        horario_preferencial: '',
        dia_preferencial: '',
        categoria: '',
        gera_tarefa_automatica: false,
        template_tarefa: {
          titulo: '',
          descricao: '',
          prazo_dias: 3
        }
      });
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof RotinaFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Limpar dia preferencial quando mudar para periodicidade diária
      if (field === 'periodicidade' && value === 'diario') {
        newData.dia_preferencial = '';
      }
      
      return newData;
    });
  };

  const handleTemplateChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      template_tarefa: {
        ...prev.template_tarefa!,
        [field]: value
      }
    }));
  };

  const clearHorarioPreferencial = () => {
    setFormData(prev => ({ ...prev, horario_preferencial: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("medium")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Nova Rotina
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
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

          {/* Seção de Geração Automática de Tarefas */}
          <Card className="border-2 border-dashed border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-yellow-600" />
                Geração Automática de Tarefas
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gera_tarefa"
                  checked={formData.gera_tarefa_automatica}
                  onCheckedChange={(checked) => handleInputChange('gera_tarefa_automatica', checked)}
                />
                <Label htmlFor="gera_tarefa" className="text-sm">
                  Gerar tarefas automaticamente quando concluir esta rotina
                </Label>
              </div>
            </CardHeader>
            
            {formData.gera_tarefa_automatica && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título da Tarefa</Label>
                  <Input
                    value={formData.template_tarefa?.titulo || ''}
                    onChange={(e) => handleTemplateChange('titulo', e.target.value)}
                    placeholder="Ex: Verificar estoque após limpeza"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição da Tarefa</Label>
                  <Textarea
                    value={formData.template_tarefa?.descricao || ''}
                    onChange={(e) => handleTemplateChange('descricao', e.target.value)}
                    placeholder="Descreva o que deve ser feito na tarefa..."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Prazo (dias)</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.template_tarefa?.prazo_dias || 3}
                      onChange={(e) => handleTemplateChange('prazo_dias', parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      dias após conclusão da rotina
                    </span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

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
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
            >
              {isSubmitting ? 'Criando...' : 'Criar Rotina'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
