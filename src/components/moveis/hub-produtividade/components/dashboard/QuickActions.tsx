import { 
  Plus, 
  Upload, 
  RefreshCw, 
  Download, 
  Search, 
  Calendar, 
  BarChart3,
  Target,
  Eye,
  Filter,
  FileText,
  CheckSquare,
  Users,
  Star,
  Settings,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useResponsive } from '@/hooks/use-responsive';
import { cn } from '@/lib/utils';
import { useQuickActionPreferences } from '../../hooks/useQuickActionPreferences';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { QuickActionsSettings } from './QuickActionsSettings';

interface QuickActionsProps {
  onNovaRotina: () => void;
  onNovaOrientacao: () => void;
  onNovaTarefa: () => void;
  onRefreshData: () => void;
  onExportData: () => void;
  onShowFilters?: () => void;
  onBuscaAvancada: () => void;
  onFiltrosPorData: () => void;
  onRelatorios: () => void;
  isRefreshing?: boolean;
  hideHeader?: boolean;
}

export function QuickActions({ 
  onNovaRotina,
  onNovaOrientacao, 
  onNovaTarefa,
  onRefreshData,
  onExportData,
  onShowFilters,
  onBuscaAvancada,
  onFiltrosPorData,
  onRelatorios,
  isRefreshing = false,
  hideHeader = false
}: QuickActionsProps) {
  const { isMobile } = useResponsive();
  
  // Hook para preferências
  const { 
    preferences, 
    isFavorite, 
    trackUsage 
  } = useQuickActionPreferences();

  // Handlers para atalhos de teclado
  const keyboardHandlers = {
    onNovaRotina: () => {
      trackUsage('nova-rotina');
      onNovaRotina();
    },
    onNovaOrientacao: () => {
      trackUsage('nova-orientacao');
      onNovaOrientacao();
    },
    onNovaTarefa: () => {
      trackUsage('nova-tarefa');
      onNovaTarefa();
    },
    onBuscaAvancada: () => {
      trackUsage('busca-avancada');
      onBuscaAvancada();
    },
    onFiltrosPorData: () => {
      trackUsage('filtros-data');
      onFiltrosPorData();
    },
    onRelatorios: () => {
      trackUsage('relatorios');
      onRelatorios();
    },
    onRefreshData: () => {
      trackUsage('atualizar');
      onRefreshData();
    },
    onExportData: () => {
      trackUsage('exportar');
      onExportData();
    }
  };

  // Ativar atalhos de teclado
  useKeyboardShortcuts(keyboardHandlers, preferences.enableKeyboardShortcuts);

  const sections = [
    {
      id: 'nova-rotina',
      title: "Nova Rotina",
      subtitle: "Criar rotina obrigatória",
      icon: Plus,
      onClick: () => {
        trackUsage('nova-rotina');
        onNovaRotina();
      },
      color: "from-green-600 to-emerald-600",
      stats: { active: 12 },
      priority: "high"
    },
    {
      id: 'nova-orientacao',
      title: "Nova Orientação",
      subtitle: "Adicionar VM ou informativo",
      icon: Upload,
      onClick: () => {
        trackUsage('nova-orientacao');
        onNovaOrientacao();
      },
      color: "from-green-500 to-green-600",
      stats: { pending: 8 },
      priority: "high"
    },
    {
      id: 'nova-tarefa',
      title: "Nova Tarefa",
      subtitle: "Criar nova tarefa",
      icon: Target,
      onClick: () => {
        trackUsage('nova-tarefa');
        onNovaTarefa();
      },
      color: "from-green-600 to-emerald-600",
      stats: { sales: 24 },
      priority: "high"
    },
    {
      id: 'busca-avancada',
      title: "Busca Avançada",
      subtitle: "Buscar com filtros",
      icon: Search,
      onClick: () => {
        trackUsage('busca-avancada');
        onBuscaAvancada();
      },
      color: "from-green-500 to-emerald-500",
      stats: { thisMonth: 156 },
      priority: "medium"
    },
    {
      id: 'filtros-data',
      title: "Por Data",
      subtitle: "Filtros temporais",
      icon: Calendar,
      onClick: () => {
        trackUsage('filtros-data');
        onFiltrosPorData();
      },
      color: "from-green-500 to-emerald-500",
      stats: { files: 7 },
      priority: "medium"
    },
    {
      id: 'relatorios',
      title: "Relatórios",
      subtitle: "Analytics e métricas",
      icon: BarChart3,
      onClick: () => {
        trackUsage('relatorios');
        onRelatorios();
      },
      color: "from-green-600 to-emerald-600",
      stats: { active: 5 },
      priority: "medium"
    },
    {
      id: 'ver-rotinas',
      title: "Ver Rotinas",
      subtitle: "Acessar todas rotinas",
      icon: CheckSquare,
      onClick: () => {
        trackUsage('ver-rotinas');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', 'rotinas');
        window.location.href = currentUrl.toString();
      },
      color: "from-emerald-500 to-emerald-600",
      stats: null,
      priority: "low"
    },
    {
      id: 'ver-orientacoes',
      title: "Ver Orientações",
      subtitle: "Acessar informativos",
      icon: FileText,
      onClick: () => {
        trackUsage('ver-orientacoes');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', 'orientacoes');
        window.location.href = currentUrl.toString();
      },
      color: "from-green-500 to-emerald-500",
      stats: null,
      priority: "low"
    },
    {
      id: 'monitoramento',
      title: "Monitoramento",
      subtitle: "Ver acompanhamento",
      icon: Users,
      onClick: () => {
        trackUsage('monitoramento');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', 'monitoramento');
        window.location.href = currentUrl.toString();
      },
      color: "from-green-600 to-emerald-600",
      stats: null,
      priority: "low"
    },
    {
      id: 'filtros',
      title: "Filtros",
      subtitle: "Aplicar filtros",
      icon: Filter,
      onClick: () => {
        trackUsage('filtros');
        onShowFilters?.();
      },
      color: "from-slate-500 to-slate-600",
      stats: null,
      priority: "low"
    },
    {
      id: 'atualizar',
      title: "Atualizar",
      subtitle: "Recarregar dados",
      icon: RefreshCw,
      onClick: () => {
        trackUsage('atualizar');
        onRefreshData();
      },
      color: "from-gray-500 to-gray-600",
      stats: null,
      isLoading: isRefreshing,
      priority: "low"
    },
    {
      id: 'exportar',
      title: "Exportar",
      subtitle: "Baixar relatórios",
      icon: Download,
      onClick: () => {
        trackUsage('exportar');
        onExportData();
      },
      color: "from-green-500 to-emerald-500",
      stats: { pending: 3 },
      priority: "low"
    }
  ];

  // Filtrar seções baseado nas preferências
  const getVisibleSections = () => {
    let filteredSections = sections;

    // Se "mostrar apenas favoritos" estiver ativo e houver favoritos
    if (preferences.showOnlyFavorites && preferences.favorites.length > 0) {
      filteredSections = sections.filter(section => isFavorite(section.id));
    } else if (isMobile) {
      // No mobile, mostrar apenas as ações mais importantes se não estiver no modo favoritos
      filteredSections = sections.filter(section => 
        section.priority === "high" || section.priority === "medium"
      );
    }

    return filteredSections;
  };

  const visibleSections = getVisibleSections();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Padronizado */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Ações Rápidas
              </h3>
              <p className="text-sm text-muted-foreground">
                {preferences.showOnlyFavorites && preferences.favorites.length > 0 
                  ? `Mostrando ${visibleSections.length} favoritos`
                  : `${visibleSections.length} ações disponíveis`
                }
                {preferences.enableKeyboardShortcuts && " • Atalhos habilitados"}
              </p>
            </div>
          </div>
          <QuickActionsSettings handlers={keyboardHandlers} />
        </div>
      )}

      {/* Grid de ações - Layout padronizado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleSections.map((section, index) => {
          const Icon = section.icon;
          const isActionFavorite = isFavorite(section.id);
          
          return (
            <Card 
              key={section.id}
              className="hover:shadow-lg cursor-pointer transition-all duration-300 group relative"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={section.onClick}
            >
              <CardContent className="p-4">
                {/* Indicador de favorito */}
                {isActionFavorite && (
                  <div className="absolute top-2 right-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color} group-hover:scale-110 transition-transform duration-200`}>
                    {section.isLoading ? (
                      <RefreshCw className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold leading-tight">
                      {section.title}
                    </h3>
                    {section.subtitle && (
                      <p className="text-xs text-muted-foreground leading-tight">
                        {section.subtitle}
                      </p>
                    )}
                    
                    {/* Badges de estatísticas */}
                    <div className="flex flex-wrap gap-1">
                      {section.stats && (
                        <>
                          {section.stats.active && (
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200">
                              {section.stats.active}
                            </Badge>
                          )}
                          {section.stats.pending && (
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                              {section.stats.pending}
                            </Badge>
                          )}
                          {section.stats.sales && (
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200">
                              {section.stats.sales}
                            </Badge>
                          )}
                          {section.stats.thisMonth && (
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {section.stats.thisMonth}
                            </Badge>
                          )}
                          {section.stats.files && (
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {section.stats.files}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensagem quando não há ações visíveis */}
      {visibleSections.length === 0 && preferences.showOnlyFavorites && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
          </div>
          <p className="text-lg font-medium">Nenhuma ação favorita selecionada</p>
          <p className="text-sm">Configure suas ações favoritas nas configurações</p>
        </div>
      )}
    </div>
  );
}
