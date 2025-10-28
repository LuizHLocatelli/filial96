import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Edit3 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMobileDialog } from '@/hooks/useMobileDialog';
import { MetaCategoria, MetaMensalForm } from "../../types/metasTypes";

interface MetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: MetaCategoria | null;
  onSubmit: (data: MetaMensalForm, metaId?: string) => Promise<boolean>;
  isLoading: boolean;
}

export function MetaDialog({ 
  open, 
  onOpenChange, 
  categoria, 
  onSubmit, 
  isLoading 
}: MetaDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [formData, setFormData] = useState<MetaMensalForm>({
    categoria_id: categoria?.id || '',
    valor_meta: categoria?.valor_meta_mensal || 0,
    descricao: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria) return;
    
    const success = await onSubmit(formData, categoria.meta_mensal_id || undefined);
    if (success) {
      onOpenChange(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isEditing = !!categoria;
  const IconComponent = isEditing ? Edit3 : Plus;

  if (!categoria) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                {isEditing ? 'Editar Meta' : 'Nova Meta'}
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              {isEditing ? 'Modifique os dados da meta existente.' : 'Defina uma nova meta para acompanhamento.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="valor_meta">Valor da Meta Mensal *</Label>
            <div className="space-y-2">
              <Input
                id="valor_meta"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_meta}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_meta: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                required
              />
              <p className="text-sm text-muted-foreground">
                Valor formatado: {formatCurrency(formData.valor_meta)}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição da meta..."
              rows={3}
            />
          </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.descricao.trim() || !formData.valor_meta}
            onClick={handleSubmit}
            variant="success"
          >
            <Target className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Meta' : 'Criar Meta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
