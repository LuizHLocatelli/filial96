import { useState, useRef, useEffect, useCallback } from 'react';
import { useHubData } from './hooks/useHubData';
import { useHubFilters } from './hooks/useHubFilters';
import { useHubHandlers } from './hooks/useHubHandlers';
import { useResponsive } from '@/hooks/use-responsive';
import { HubViewMode } from './types';
import { HUB_SECTIONS } from './constants/hubSections';
import { convertToMobileFilters, convertFromMobileFilters } from './utils/filterConversions';
import { HubMobileLayout } from './components/layouts/HubMobileLayout';
import { HubDesktopLayout } from './components/layouts/HubDesktopLayout';

// Sistema melhorado de controle de instâncias
class InstanceManager {
  private static activeInstance: string | null = null;
  private static pendingInstances = new Set<string>();
  private static listeners = new Map<string, () => void>();

  static register(instanceId: string): boolean {
    // Se não há instância ativa, esta se torna a ativa
    if (!this.activeInstance) {
      this.activeInstance = instanceId;
      this.pendingInstances.delete(instanceId);
      return true;
    }

    // Se é a instância ativa atual, continua ativa
    if (this.activeInstance === instanceId) {
      return true;
    }

    // Adiciona às pendentes sem log excessivo
    this.pendingInstances.add(instanceId);
    return false;
  }

  static unregister(instanceId: string): void {
    if (this.activeInstance === instanceId) {
      this.activeInstance = null;
      
      // Ativar próxima instância pendente, se houver
      const nextInstance = this.pendingInstances.values().next().value;
      if (nextInstance) {
        this.activeInstance = nextInstance;
        this.pendingInstances.delete(nextInstance);
        
        // Notificar a nova instância ativa
        const listener = this.listeners.get(nextInstance);
        if (listener) {
          listener();
        }
      }
    } else {
      this.pendingInstances.delete(instanceId);
    }
    
    this.listeners.delete(instanceId);
  }

  static setListener(instanceId: string, listener: () => void): void {
    this.listeners.set(instanceId, listener);
  }

  static isActive(instanceId: string): boolean {
    return this.activeInstance === instanceId;
  }
}

export function HubProdutividade() {
  const instanceId = useRef(Math.random().toString(36).substring(7));
  const [isActiveInstance, setIsActiveInstance] = useState(false);

  // Callback para quando esta instância se tornar ativa
  const onBecomeActive = useCallback(() => {
    setIsActiveInstance(true);
  }, []);

  // Controle de instância melhorado
  useEffect(() => {
    const id = instanceId.current;
    
    // Registrar listener
    InstanceManager.setListener(id, onBecomeActive);
    
    // Verificar se pode ser ativa
    const canBeActive = InstanceManager.register(id);
    setIsActiveInstance(canBeActive);

    return () => {
      InstanceManager.unregister(id);
    };
  }, [onBecomeActive]);

  // Estados locais
  const [currentSection, setCurrentSection] = useState<HubViewMode>('dashboard');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Hook de responsividade
  const { isMobile, isTablet } = useResponsive();

  // Hooks para dados e filtros (só executar se for a instância ativa)
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

  // Hook para handlers
  const handlers = useHubHandlers({
    setCurrentSection,
    setSearchTerm,
    setFilterSearchTerm,
    setShowMobileSearch,
    setShowFilters,
    refreshData
  });

  // Se não for a instância ativa, não renderizar (sem log excessivo)
  if (!isActiveInstance) {
    return null;
  }

  // Configuração das seções com badges
  const sectionsWithBadges = HUB_SECTIONS.map(section => ({
    ...section,
    badge: section.id === 'dashboard' 
      ? (filterStats.hasActiveFilters ? filterStats.total : undefined)
      : section.id === 'rotinas' 
      ? (stats.rotinas.atrasadas > 0 ? stats.rotinas.atrasadas : undefined)
      : section.id === 'orientacoes'
      ? (stats.orientacoes.naoLidas > 0 ? stats.orientacoes.naoLidas : undefined)
      : section.id === 'tarefas'
      ? (stats.tarefas.atrasadas > 0 ? stats.tarefas.atrasadas : undefined)
      : undefined
  }));

  // Badges para navegação mobile
  const navigationBadges = {
    dashboard: filterStats.hasActiveFilters ? filterStats.total : undefined,
    rotinas: stats.rotinas.atrasadas > 0 ? stats.rotinas.atrasadas : undefined,
    orientacoes: stats.orientacoes.naoLidas > 0 ? stats.orientacoes.naoLidas : undefined,
    monitoramento: undefined, // Será implementado com estatísticas específicas
    tarefas: stats.tarefas.atrasadas > 0 ? stats.tarefas.atrasadas : undefined
  };

  // Conversões de filtros
  const mobileFilters = convertToMobileFilters(searchTerm, filters);
  
  const handleFiltersChange = (newFilters: typeof mobileFilters) => {
    convertFromMobileFilters(newFilters, setSearchTerm, setFilterSearchTerm);
  };

  // Dados para props
  const totalItems = stats.rotinas.total + stats.orientacoes.total + stats.tarefas.total;

  // Layout Mobile
  if (isMobile) {
    return (
      <HubMobileLayout
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        showMobileSearch={showMobileSearch}
        onCloseMobileSearch={() => setShowMobileSearch(false)}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        searchTerm={searchTerm}
        navigationBadges={navigationBadges}
        hasActiveFilters={filterStats.hasActiveFilters}
        totalResults={filterStats.total}
        stats={stats}
        activities={filteredActivities}
        isLoading={isLoading}
        mobileFilters={mobileFilters}
        handlers={handlers}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
        rotinas={rotinas}
        orientacoes={orientacoes}
        tarefas={tarefas}
      />
    );
  }

  // Layout Desktop/Tablet
  return (
    <HubDesktopLayout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      searchTerm={searchTerm}
      sections={sectionsWithBadges}
      hasActiveFilters={filterStats.hasActiveFilters}
      totalResults={filterStats.total}
      totalItems={totalItems}
      stats={stats}
      activities={filteredActivities}
      isLoading={isLoading}
      isTablet={isTablet}
      mobileFilters={mobileFilters}
      handlers={handlers}
      onFiltersChange={handleFiltersChange}
      onClearFilters={clearFilters}
      rotinas={rotinas}
      orientacoes={orientacoes}
      tarefas={tarefas}
    />
  );
}
