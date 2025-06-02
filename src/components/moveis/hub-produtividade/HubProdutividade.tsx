import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  CheckSquare, 
  FileText, 
  List, 
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useHubData } from './hooks/useHubData';
import { useHubFilters } from './hooks/useHubFilters';
import { useResponsive } from '@/hooks/use-responsive';
import { StatsOverview } from './components/dashboard/StatsOverview';
import { QuickActions } from './components/dashboard/QuickActions';
import { ActivityTimeline } from './components/unified/ActivityTimeline';
import { MobileNavigation } from './components/mobile/MobileNavigation';
import { ResponsiveGrid, DashboardGrid, StatsGrid } from './components/mobile/ResponsiveGrid';
import { MobileFilters } from './components/mobile/MobileFilters';
import { HubViewMode } from './types';
import { cn } from '@/lib/utils';

// Importar componentes existentes (que serão adaptados)
import { Rotinas } from '../rotinas/Rotinas';
import { VmTarefas } from '../orientacoes/Orientacoes';
import { OrientacaoTarefas } from '../orientacoes/OrientacaoTarefas';

export function HubProdutividade() {
  const [currentSection, setCurrentSection] = useState<HubViewMode>('dashboard');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Hook de responsividade
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Hooks para dados e filtros
  const {
    stats,
    activities,
    rotinas,
    orientacoes,
    tarefas,
    isLoading,
    refreshData
  } = useHubData();

  const {
    filters,
    filteredRotinas,
    filteredOrientacoes,
    filteredTarefas,
    filteredActivities,
    filterStats,
    setSearchTerm: setFilterSearchTerm,
    clearFilters
  } = useHubFilters({
    rotinas,
    orientacoes,
    tarefas,
    activities
  });

  // Configuração das seções do hub
  const sections = [
    {
      id: 'dashboard' as HubViewMode,
      title: 'Dashboard',
      icon: BarChart3,
      badge: filterStats.hasActiveFilters ? filterStats.total : undefined,
      description: 'Visão geral da produtividade'
    },
    {
      id: 'rotinas' as HubViewMode,
      title: 'Rotinas',
      icon: CheckSquare,
      badge: stats.rotinas.atrasadas > 0 ? stats.rotinas.atrasadas : undefined,
      description: 'Rotinas obrigatórias'
    },
    {
      id: 'orientacoes' as HubViewMode,
      title: 'Orientações',
      icon: FileText,
      badge: stats.orientacoes.naoLidas > 0 ? stats.orientacoes.naoLidas : undefined,
      description: 'Documentos e orientações'
    },
    {
      id: 'tarefas' as HubViewMode,
      title: 'Tarefas',
      icon: List,
      badge: stats.tarefas.atrasadas > 0 ? stats.tarefas.atrasadas : undefined,
      description: 'Gestão de tarefas'
    }
  ];

  // Badges para navegação mobile
  const navigationBadges = {
    dashboard: filterStats.hasActiveFilters ? filterStats.total : undefined,
    rotinas: stats.rotinas.atrasadas > 0 ? stats.rotinas.atrasadas : undefined,
    orientacoes: stats.orientacoes.naoLidas > 0 ? stats.orientacoes.naoLidas : undefined,
    tarefas: stats.tarefas.atrasadas > 0 ? stats.tarefas.atrasadas : undefined
  };

  // Handlers para ações
  const handleNovaRotina = () => {
    setCurrentSection('rotinas');
    // TODO: Abrir dialog de nova rotina
  };

  const handleNovaOrientacao = () => {
    setCurrentSection('orientacoes');
    // TODO: Abrir dialog de nova orientação
  };

  const handleNovaTarefa = () => {
    setCurrentSection('tarefas');
    // TODO: Abrir dialog de nova tarefa
  };

  const handleExportData = () => {
    // TODO: Implementar exportação
    console.log('Exportar dados...');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilterSearchTerm(term);
  };

  const handleRefreshData = async () => {
    await refreshData();
  };

  const handleShowMobileSearch = () => {
    setShowMobileSearch(true);
  };

  const handleShowFilters = () => {
    setShowFilters(true);
  };

  // Filtros adaptados para mobile
  const adaptedFilters = {
    search: searchTerm,
    status: filters.status || [],
    dateRange: filters.dateRange || {},
    categoria: filters.categoria || [],
    prioridade: filters.prioridade || [],
    responsavel: filters.responsavel || [],
    showCompleted: filters.showCompleted ?? true,
    sortBy: filters.sortBy || 'data',
    sortOrder: filters.sortOrder || 'desc' as const
  };

  const handleFiltersChange = (newFilters: typeof adaptedFilters) => {
    // Atualizar filtros no hook
    setSearchTerm(newFilters.search);
    setFilterSearchTerm(newFilters.search);
    // TODO: Implementar outros filtros no hook useHubFilters
  };

  // Layout Mobile
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20"> {/* Padding bottom para bottom nav */}
        <MobileNavigation
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          badges={navigationBadges}
          onSearch={handleShowMobileSearch}
          onFilters={handleShowFilters}
          hasActiveFilters={filterStats.hasActiveFilters}
        />

        {/* Busca Mobile Expansível */}
        {showMobileSearch && (
          <div className="p-4 border-b bg-background">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em tudo..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Indicadores de filtros ativos */}
        {filterStats.hasActiveFilters && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {filterStats.total} resultados filtrados
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blue-800 hover:text-blue-900 p-1"
              >
                Limpar
              </Button>
            </div>
          </div>
        )}

        {/* Conteúdo das Seções Mobile */}
        <div className="p-4 space-y-6">
          {currentSection === 'dashboard' && (
            <div className="space-y-6">
              <StatsGrid>
                <StatsOverview stats={stats} isLoading={isLoading} />
              </StatsGrid>
              
              <QuickActions
                onNovaRotina={handleNovaRotina}
                onNovaOrientacao={handleNovaOrientacao}
                onNovaTarefa={handleNovaTarefa}
                onRefreshData={handleRefreshData}
                onExportData={handleExportData}
                onShowFilters={handleShowFilters}
                isRefreshing={isLoading}
              />
              
              <ActivityTimeline
                activities={filteredActivities}
                isLoading={isLoading}
                maxItems={10}
              />
            </div>
          )}

          {currentSection === 'rotinas' && (
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <Rotinas />
            </div>
          )}

          {currentSection === 'orientacoes' && (
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <VmTarefas />
            </div>
          )}

          {currentSection === 'tarefas' && (
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <OrientacaoTarefas />
            </div>
          )}
        </div>

        {/* Mobile Filters */}
        <MobileFilters
          isOpen={showFilters}
          onOpenChange={setShowFilters}
          filters={adaptedFilters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          hasActiveFilters={filterStats.hasActiveFilters}
        />
      </div>
    );
  }

  // Layout Desktop/Tablet (layout existente melhorado)
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
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <MobileFilters
                isOpen={showFilters}
                onOpenChange={setShowFilters}
                filters={adaptedFilters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
                hasActiveFilters={filterStats.hasActiveFilters}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {filterStats.hasActiveFilters && (
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
                onClick={handleRefreshData}
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
        {filterStats.hasActiveFilters && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-800">
              Mostrando {filterStats.total} de {stats.rotinas.total + stats.orientacoes.total + stats.tarefas.total} itens
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-blue-800 hover:text-blue-900"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Navegação por Tabs */}
      <Tabs value={currentSection} onValueChange={(value) => setCurrentSection(value as HubViewMode)}>
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
                    onNovaRotina={handleNovaRotina}
                    onNovaOrientacao={handleNovaOrientacao}
                    onNovaTarefa={handleNovaTarefa}
                    onRefreshData={handleRefreshData}
                    onExportData={handleExportData}
                    onShowFilters={handleShowFilters}
                    isRefreshing={isLoading}
                  />
                  
                  <ActivityTimeline
                    activities={filteredActivities}
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