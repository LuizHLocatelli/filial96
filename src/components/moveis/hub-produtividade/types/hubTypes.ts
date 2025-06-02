
export interface HubSection {
  id: 'dashboard' | 'rotinas' | 'orientacoes' | 'tarefas';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description: string;
}

export interface NavigationBadges {
  dashboard?: number;
  rotinas?: number;
  orientacoes?: number;
  tarefas?: number;
}

export interface HubHandlers {
  onNovaRotina: () => void;
  onNovaOrientacao: () => void;
  onNovaTarefa: () => void;
  onExportData: () => void;
  onSearch: (term: string) => void;
  onRefreshData: () => Promise<void>;
  onShowMobileSearch: () => void;
  onShowFilters: () => void;
}
