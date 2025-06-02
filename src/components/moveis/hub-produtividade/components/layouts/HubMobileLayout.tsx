
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { HubViewMode, ProductivityStats } from '../../types';
import { ActivityItem } from '../../types';
import { NavigationBadges, HubHandlers } from '../../types/hubTypes';
import { FilterState } from '../mobile/MobileFilters';
import { MobileNavigation } from '../mobile/MobileNavigation';
import { MobileFilters } from '../mobile/MobileFilters';
import { HubDashboard } from '../dashboard/HubDashboard';
import { Rotinas } from '../../../rotinas/Rotinas';
import { VmTarefas } from '../../../orientacoes/Orientacoes';
import { OrientacaoTarefas } from '../../../orientacoes/OrientacaoTarefas';

interface HubMobileLayoutProps {
  currentSection: HubViewMode;
  onSectionChange: (section: HubViewMode) => void;
  showMobileSearch: boolean;
  onCloseMobileSearch: () => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  searchTerm: string;
  navigationBadges: NavigationBadges;
  hasActiveFilters: boolean;
  totalResults: number;
  stats: ProductivityStats;
  activities: ActivityItem[];
  isLoading: boolean;
  mobileFilters: FilterState;
  handlers: HubHandlers;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function HubMobileLayout({
  currentSection,
  onSectionChange,
  showMobileSearch,
  onCloseMobileSearch,
  showFilters,
  onShowFiltersChange,
  searchTerm,
  navigationBadges,
  hasActiveFilters,
  totalResults,
  stats,
  activities,
  isLoading,
  mobileFilters,
  handlers,
  onFiltersChange,
  onClearFilters
}: HubMobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileNavigation
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        badges={navigationBadges}
        onSearch={handlers.onShowMobileSearch}
        onFilters={handlers.onShowFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Busca Mobile */}
      {showMobileSearch && (
        <div className="p-4 border-b bg-background sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar em tudo..."
              value={searchTerm}
              onChange={(e) => handlers.onSearch(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseMobileSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Indicadores de filtros ativos */}
      {hasActiveFilters && (
        <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {totalResults} resultados filtrados
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-blue-800 hover:text-blue-900 p-1"
            >
              Limpar
            </Button>
          </div>
        </div>
      )}

      {/* Conteúdo das Seções */}
      <div className="p-4">
        {currentSection === 'dashboard' && (
          <HubDashboard
            stats={stats}
            activities={activities}
            isLoading={isLoading}
            handlers={handlers}
          />
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
        onOpenChange={onShowFiltersChange}
        filters={mobileFilters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
