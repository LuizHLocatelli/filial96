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
      label: 'Visualização por Data',
      icon: Calendar,
      description: 'Ver itens por período'
    },
    {
      id: 'analytics',
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Análises detalhadas'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'Personalizar o hub'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Ações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Ações Primárias - Criar novos itens */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Criar Novo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {primaryActions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    onClick={action.action}
                    disabled={action.disabled}
                    className="flex items-center gap-2 h-auto py-3 px-4"
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Ações Secundárias - Utilitários */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Ferramentas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {secondaryActions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    onClick={action.action}
                    disabled={action.disabled}
                    className="flex items-center gap-2 h-auto py-3 px-4"
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
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funcionalidades Avançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {utilityActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-md bg-muted">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <h5 className="font-medium text-sm">{action.label}</h5>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas e Ajuda */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-medium text-blue-900">💡 Dicas de Produtividade</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Configure rotinas diárias para manter a consistência</p>
              <p>• Revise as orientações regularmente para se manter atualizado</p>
              <p>• Use filtros para focar no que é mais importante</p>
              <p>• Acompanhe seu progresso através das estatísticas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 