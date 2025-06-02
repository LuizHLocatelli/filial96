
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { HubViewMode, ProductivityStats } from '../../types';
import { ActivityItem } from '../../types';
import { HubSection, HubHandlers } from '../../types/hubTypes';
import { FilterState } from '../mobile/MobileFilters';
import { MobileFilters } from '../mobile/MobileFilters';
import { DashboardGrid } from '../mobile/ResponsiveGrid';
import { StatsOverview } from '../dashboard/StatsOverview';
import { QuickActions } from '../dashboard/QuickActions';
import { ActivityTimeline } from '../unified/ActivityTimeline';
import { Rotinas } from '../../../rotinas/Rotinas';
import { VmTarefas } from '../../../orientacoes/Orientacoes';
import { OrientacaoTarefas } from '../../../orientacoes/OrientacaoTarefas';
import { cn } from '@/lib/utils';

interface HubDesktopLayoutProps {
  currentSection: HubViewMode;
  onSectionChange: (section: HubViewMode) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  searchTerm: string;
  sections: HubSection[];
  hasActiveFilters: boolean;
  totalResults: number;
  totalItems: number;
  stats: ProductivityStats;
  activities: ActivityItem[];
  isLoading: boolean;
  isTablet: boolean;
  mobileFilters: FilterState;
  handlers: HubHandlers;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function HubDesktopLayout({
  currentSection,
  onSectionChange,
  showFilters,
  onShowFiltersChange,
  searchTerm,
  sections,
  hasActiveFilters,
  totalResults,
  totalItems,
  stats,
  activities,
  isLoading,
  isTablet,
  mobileFilters,
  handlers,
  onFiltersChange,
  onClearFilters
}: HubDesktopLayoutProps) {
  return (
    <div className="space-y-6 px-1 sm:px-0">
      {/* Header do Hub */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Activity className="h-7 w-7 text-primary" />
              Hub de Produtividade
            </h1>
            <p className="text-muted-foreground">
              Centralize suas rotinas, orientações e tarefas em um só lugar
            </p>
          </div>

          {/* Busca e filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em tudo..."
                value={searchTerm}
                onChange={(e) => handlers.onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <MobileFilters
                isOpen={showFilters}
                onOpenChange={onShowFiltersChange}
                filters={mobileFilters}
                onFiltersChange={onFiltersChange}
                onClearFilters={onClearFilters}
                hasActiveFilters={hasActiveFilters}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                        !
                      </Badge>
                    )}
                  </Button>
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handlers.onRefreshData}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Indicadores de filtros ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-800">
              Mostrando {totalResults} de {totalItems} itens
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-blue-800 hover:text-blue-900"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Navegação por Tabs */}
      <Tabs value={currentSection} onValueChange={(value) => onSectionChange(value as HubViewMode)}>
        <TabsList className={cn(
          "grid w-full h-auto p-1",
          isTablet ? "grid-cols-2" : "grid-cols-4"
        )}>
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex flex-col items-center gap-1 py-3 px-2 sm:px-4 relative"
            >
              <div className="flex items-center gap-2">
                <section.icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">{section.title}</span>
              </div>
              {section.badge && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {section.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Conteúdo das Tabs */}
        <div className="space-y-6">
          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardGrid
              main={<StatsOverview stats={stats} isLoading={isLoading} />}
              sidebar={
                <div className="space-y-6">
                  <QuickActions
                    onNovaRotina={handlers.onNovaRotina}
                    onNovaOrientacao={handlers.onNovaOrientacao}
                    onNovaTarefa={handlers.onNovaTarefa}
                    onRefreshData={handlers.onRefreshData}
                    onExportData={handlers.onExportData}
                    onShowFilters={handlers.onShowFilters}
                    isRefreshing={isLoading}
                  />
                  
                  <ActivityTimeline
                    activities={activities}
                    isLoading={isLoading}
                    maxItems={10}
                  />
                </div>
              }
            />
          </TabsContent>

          {/* Rotinas */}
          <TabsContent value="rotinas" className="space-y-4">
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <Rotinas />
            </div>
          </TabsContent>

          {/* Orientações */}
          <TabsContent value="orientacoes" className="space-y-4">
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <VmTarefas />
            </div>
          </TabsContent>

          {/* Tarefas */}
          <TabsContent value="tarefas" className="space-y-4">
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <OrientacaoTarefas />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
