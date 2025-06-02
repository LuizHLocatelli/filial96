
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Upload, 
  Download,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';
import { QuickAction } from '../../types';
import { useResponsive } from '@/hooks/use-responsive';

interface QuickActionsProps {
  onNovaRotina: () => void;
  onNovaOrientacao: () => void;
  onNovaTarefa: () => void;
  onRefreshData: () => void;
  onExportData: () => void;
  onShowFilters: () => void;
  isRefreshing?: boolean;
}

export function QuickActions({ 
  onNovaRotina,
  onNovaOrientacao, 
  onNovaTarefa,
  onRefreshData,
  onExportData,
  onShowFilters,
  isRefreshing = false
}: QuickActionsProps) {
  const { isMobile } = useResponsive();

  const primaryActions: QuickAction[] = [
    {
      id: 'nova-rotina',
      label: 'Nova Rotina',
      icon: Plus,
      action: onNovaRotina,
      variant: 'default'
    },
    {
      id: 'nova-orientacao',
      label: 'Nova Orientação',
      icon: Upload,
      action: onNovaOrientacao,
      variant: 'outline'
    },
    {
      id: 'nova-tarefa',
      label: 'Nova Tarefa',
      icon: Plus,
      action: onNovaTarefa,
      variant: 'outline'
    }
  ];

  const secondaryActions: QuickAction[] = [
    {
      id: 'refresh',
      label: 'Atualizar',
      icon: RefreshCw,
      action: onRefreshData,
      variant: 'outline',
      disabled: isRefreshing
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: Download,
      action: onExportData,
      variant: 'outline'
    },
    {
      id: 'filters',
      label: 'Filtros',
      icon: Filter,
      action: onShowFilters,
      variant: 'outline'
    }
  ];

  const utilityActions = [
    {
      id: 'search',
      label: 'Busca Avançada',
      icon: Search,
      description: 'Pesquisar em todos os itens'
    },
    {
      id: 'calendar',
      label: 'Por Data',
      icon: Calendar,
      description: 'Ver itens por período'
    },
    {
      id: 'analytics',
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Análises detalhadas'
    }
  ];

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Ações Principais - Mobile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {primaryActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  onClick={action.action}
                  disabled={action.disabled}
                  className="w-full justify-start gap-2 h-10"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              {secondaryActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  onClick={action.action}
                  disabled={action.disabled}
                  className="flex flex-col items-center gap-1 h-12 p-2"
                >
                  {action.id === 'refresh' && isRefreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <action.icon className="h-4 w-4" />
                  )}
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ações Principais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ações Primárias */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Criar Novo</h4>
            <div className="grid grid-cols-1 gap-2">
              {primaryActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  onClick={action.action}
                  disabled={action.disabled}
                  className="justify-start gap-2 h-10"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Ações Secundárias */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Ferramentas</h4>
            <div className="grid grid-cols-1 gap-2">
              {secondaryActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  onClick={action.action}
                  disabled={action.disabled}
                  className="justify-start gap-2 h-9"
                >
                  {action.id === 'refresh' && isRefreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <action.icon className="h-4 w-4" />
                  )}
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades Avançadas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {utilityActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:border-border transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-muted">
                  <action.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <h5 className="font-medium text-sm">{action.label}</h5>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
