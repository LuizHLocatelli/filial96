
export interface HubSection {
  id: 'cartazes' | 'monitoramento';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description: string;
}

export interface NavigationBadges {
  cartazes?: number;
  monitoramento?: number;
}

export interface HubHandlers {
  onExportData: () => void;
  onSearch: (term: string) => void;
  onRefreshData: () => Promise<void>;
  onShowMobileSearch: () => void;
  onShowFilters: () => void;
  onBuscaAvancada?: () => void;
  onFiltrosPorData?: () => void;
  onRelatorios?: () => void;
  onNavigateToSection?: (section: 'cartazes' | 'monitoramento') => void;
}
