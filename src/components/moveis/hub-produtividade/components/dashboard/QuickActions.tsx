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
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useResponsive } from '@/hooks/use-responsive';
import { cn } from '@/lib/utils';

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
  isRefreshing = false
}: QuickActionsProps) {
  const { isMobile } = useResponsive();

  const sections = [
    {
      title: "Nova Rotina",
      subtitle: "Criar rotina obrigatória",
      icon: Plus,
      onClick: onNovaRotina,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      stats: { active: 12 },
      priority: "high"
    },
    {
      title: "Nova Orientação",
      subtitle: "Adicionar VM ou informativo",
      icon: Upload,
      onClick: onNovaOrientacao,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      stats: { pending: 8 },
      priority: "high"
    },
    {
      title: "Nova Tarefa",
      subtitle: "Criar nova tarefa",
      icon: Target,
      onClick: onNovaTarefa,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      stats: { sales: 24 },
      priority: "high"
    },
    {
      title: "Busca Avançada",
      subtitle: "Buscar com filtros",
      icon: Search,
      onClick: onBuscaAvancada,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      stats: { thisMonth: 156 },
      priority: "medium"
    },
    {
      title: "Por Data",
      subtitle: "Filtros temporais",
      icon: Calendar,
      onClick: onFiltrosPorData,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      stats: { files: 7 },
      priority: "medium"
    },
    {
      title: "Relatórios",
      subtitle: "Analytics e métricas",
      icon: BarChart3,
      onClick: onRelatorios,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
      stats: { active: 5 },
      priority: "medium"
    },
    {
      title: "Ver Rotinas",
      subtitle: "Acessar todas rotinas",
      icon: CheckSquare,
      onClick: () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', 'rotinas');
        window.location.href = currentUrl.toString();
      },
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      stats: null,
      priority: "low"
    },
    {
      title: "Ver Orientações",
      subtitle: "Acessar informativos",
      icon: FileText,
      onClick: () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', 'orientacoes');
        window.location.href = currentUrl.toString();
      },
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
      stats: null,
      priority: "low"
    },
    {
      title: "Monitoramento",
      subtitle: "Ver acompanhamento",
      icon: Users,
      onClick: () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', 'monitoramento');
        window.location.href = currentUrl.toString();
      },
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50 dark:bg-violet-950/20",
      stats: null,
      priority: "low"
    },
    {
      title: "Filtros",
      subtitle: "Aplicar filtros",
      icon: Filter,
      onClick: onShowFilters || (() => {}),
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-950/20",
      stats: null,
      priority: "low"
    },
    {
      title: "Atualizar",
      subtitle: "Recarregar dados",
      icon: RefreshCw,
      onClick: onRefreshData,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-950/20",
      stats: null,
      isLoading: isRefreshing,
      priority: "low"
    },
    {
      title: "Exportar",
      subtitle: "Baixar relatórios",
      icon: Download,
      onClick: onExportData,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
      stats: { pending: 3 },
      priority: "low"
    }
  ];

  // Filtrar seções baseado na prioridade e espaço disponível
  const getVisibleSections = () => {
    if (isMobile) {
      // No mobile, mostrar apenas as ações mais importantes
      return sections.filter(section => section.priority === "high" || section.priority === "medium");
    }
    return sections; // Desktop mostra todas
  };

  const visibleSections = getVisibleSections();

  return (
    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}`}>
      {visibleSections.map((section, index) => {
        const Icon = section.icon;
        return (
          <Card 
            key={section.title}
            className={`hover-lift cursor-pointer transition-all duration-300 border-0 shadow-soft hover:shadow-medium group ${section.bgColor}`}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={section.onClick}
          >
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
              <div className="space-y-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} group-hover:scale-110 transition-transform duration-200`}>
                  {section.isLoading ? (
                    <RefreshCw className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold leading-tight`}>{section.title}</h3>
                  {!isMobile && section.subtitle && (
                    <p className="text-xs text-muted-foreground leading-tight">{section.subtitle}</p>
                  )}
                  <div className="flex gap-1">
                    {section.title === "Nova Rotina" && section.stats && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {section.stats.active}
                      </Badge>
                    )}
                    {section.title === "Nova Orientação" && section.stats && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {section.stats.pending}
                      </Badge>
                    )}
                    {section.title === "Nova Tarefa" && section.stats && (
                      <Badge variant="outline" className="text-xs px-1 py-0 text-green-600">
                        {section.stats.sales}
                      </Badge>
                    )}
                    {section.title === "Busca Avançada" && section.stats && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {section.stats.thisMonth}
                      </Badge>
                    )}
                    {section.title === "Por Data" && section.stats && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {section.stats.files}
                      </Badge>
                    )}
                    {section.title === "Relatórios" && section.stats && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {section.stats.active}
                      </Badge>
                    )}
                    {section.title === "Exportar" && section.stats && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {section.stats.pending}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
