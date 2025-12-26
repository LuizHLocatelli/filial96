
export interface HubSection {
  id: 'cartazes' | 'orientacoes' | 'monitoramento' | 'assistentes';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description: string;
}

export interface NavigationBadges {
  cartazes?: number;
  orientacoes?: number;
  monitoramento?: number;
  assistentes?: number;
}

export interface HubHandlers {
  onNovaOrientacao: () => void;
  onExportData: () => void;
  onSearch: (term: string) => void;
  onRefreshData: () => Promise<void>;
  onShowMobileSearch: () => void;
  onShowFilters: () => void;
  onBuscaAvancada?: () => void;
  onFiltrosPorData?: () => void;
  onRelatorios?: () => void;
  onNavigateToSection?: (section: 'cartazes' | 'orientacoes' | 'monitoramento' | 'assistentes') => void;
}
