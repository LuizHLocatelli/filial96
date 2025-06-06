import { useState, useEffect, useCallback } from 'react';

export type LayoutDensity = 'compact' | 'normal' | 'comfortable';

interface LayoutPreferences {
  density: LayoutDensity;
  autoCompactOnSmallScreen: boolean;
  statsPerRow: number;
  showResumoRapido: boolean;
}

interface LayoutConfig {
  spacing: string;
  cardPadding: string;
  headerSize: string;
  iconSize: string;
  fontSize: string;
  statsGrid: string;
}

const DEFAULT_PREFERENCES: LayoutPreferences = {
  density: 'normal',
  autoCompactOnSmallScreen: true,
  statsPerRow: 4,
  showResumoRapido: true
};

const STORAGE_KEY = 'hub-produtividade-layout-preferences';

export function useLayoutPreferences() {
  const [preferences, setPreferences] = useState<LayoutPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferências do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.warn('Erro ao carregar preferências de layout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar preferências no localStorage
  const savePreferences = useCallback((newPreferences: Partial<LayoutPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Erro ao salvar preferências de layout:', error);
    }
  }, [preferences]);

  // Configurações de layout baseadas na densidade
  const getLayoutConfig = useCallback((density: LayoutDensity = preferences.density): LayoutConfig => {
    const configs: Record<LayoutDensity, LayoutConfig> = {
      compact: {
        spacing: 'space-y-2',
        cardPadding: 'p-2',
        headerSize: 'text-sm',
        iconSize: 'h-3 w-3',
        fontSize: 'text-xs',
        statsGrid: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'
      },
      normal: {
        spacing: 'space-y-3',
        cardPadding: 'p-3',
        headerSize: 'text-base',
        iconSize: 'h-3.5 w-3.5',
        fontSize: 'text-sm',
        statsGrid: 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6'
      },
      comfortable: {
        spacing: 'space-y-4',
        cardPadding: 'p-4',
        headerSize: 'text-lg',
        iconSize: 'h-4 w-4',
        fontSize: 'text-base',
        statsGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }
    };

    return configs[density];
  }, [preferences.density]);

  // Função para resetar preferências
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Erro ao resetar preferências:', error);
    }
  }, []);

  // Função para exportar preferências
  const exportPreferences = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  // Função para importar preferências
  const importPreferences = useCallback((data: string) => {
    try {
      const imported = JSON.parse(data);
      const validated = { ...DEFAULT_PREFERENCES, ...imported };
      savePreferences(validated);
      return true;
    } catch (error) {
      console.error('Erro ao importar preferências:', error);
      return false;
    }
  }, [savePreferences]);

  // Funções específicas para cada preferência
  const setDensity = useCallback((density: LayoutDensity) => {
    savePreferences({ density });
  }, [savePreferences]);

  const toggleResumoRapido = useCallback(() => {
    savePreferences({ showResumoRapido: !preferences.showResumoRapido });
  }, [savePreferences, preferences.showResumoRapido]);

  const setStatsPerRow = useCallback((statsPerRow: number) => {
    savePreferences({ statsPerRow: Math.max(2, Math.min(8, statsPerRow)) });
  }, [savePreferences]);

  return {
    // Estado
    preferences,
    isLoading,
    layoutConfig: getLayoutConfig(),

    // Ações
    setDensity,
    toggleResumoRapido,
    setStatsPerRow,
    savePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences,

    // Utilitários
    getLayoutConfig,
    
    // Estados derivados
    isCompact: preferences.density === 'compact',
    isComfortable: preferences.density === 'comfortable',
    shouldShowResumoRapido: preferences.showResumoRapido
  };
} 