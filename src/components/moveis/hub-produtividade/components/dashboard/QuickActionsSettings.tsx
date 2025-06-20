import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Star,
  Keyboard,
  BarChart3,
  Heart,
  Trash2,
  Info,
  Move,
  Zap
} from 'lucide-react';
import { useQuickActionPreferences } from '../../hooks/useQuickActionPreferences';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface QuickActionsSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    showAddRotina: boolean;
    showAddOrientacao: boolean;
    showAddTarefa: boolean;
    showBuscaAvancada: boolean;
    showRelatorios: boolean;
    showFiltros: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export function QuickActionsSettings({ 
  open, 
  onOpenChange, 
  settings, 
  onSettingsChange 
}: QuickActionsSettingsProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  const handleToggle = (key: string, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Configurar Ações Rápidas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Escolha quais ações rápidas devem aparecer no painel
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="addRotina" className="flex-1">
                Adicionar Rotina
              </Label>
              <Switch
                id="addRotina"
                checked={settings.showAddRotina}
                onCheckedChange={(checked) => handleToggle('showAddRotina', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="addOrientacao" className="flex-1">
                Adicionar Orientação
              </Label>
              <Switch
                id="addOrientacao"
                checked={settings.showAddOrientacao}
                onCheckedChange={(checked) => handleToggle('showAddOrientacao', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="addTarefa" className="flex-1">
                Adicionar Tarefa
              </Label>
              <Switch
                id="addTarefa"
                checked={settings.showAddTarefa}
                onCheckedChange={(checked) => handleToggle('showAddTarefa', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="buscaAvancada" className="flex-1">
                Busca Avançada
              </Label>
              <Switch
                id="buscaAvancada"
                checked={settings.showBuscaAvancada}
                onCheckedChange={(checked) => handleToggle('showBuscaAvancada', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="relatorios" className="flex-1">
                Relatórios
              </Label>
              <Switch
                id="relatorios"
                checked={settings.showRelatorios}
                onCheckedChange={(checked) => handleToggle('showRelatorios', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="filtros" className="flex-1">
                Filtros por Data
              </Label>
              <Switch
                id="filtros"
                checked={settings.showFiltros}
                onCheckedChange={(checked) => handleToggle('showFiltros', checked)}
              />
            </div>
          </div>
        </div>

        <div {...getMobileFooterProps()}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 