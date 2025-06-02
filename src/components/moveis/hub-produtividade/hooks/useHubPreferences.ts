import { useState, useEffect, useCallback } from 'react';
import { HubFilters, HubViewMode } from '../types';

interface HubPreferences {
  lastActiveTab: HubViewMode;
  savedFilters: Partial<HubFilters>;
  viewSettings: {
    itemsPerPage: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    compactView: boolean;
  };
  dashboardLayout: {
    hiddenCards: string[];
    cardOrder: string[];
  };
}

const DEFAULT_PREFERENCES: HubPreferences = {
  lastActiveTab: 'dashboard',
  savedFilters: {},
  viewSettings: {
    itemsPerPage: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    compactView: false
  },
  dashboardLayout: {
    hiddenCards: [],
    cardOrder: []
  }
};

const STORAGE_KEY = 'hub-produtividade-preferences';

export function useHubPreferences() {
  const [preferences, setPreferences] = useState<HubPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferências do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(prev => ({
          ...DEFAULT_PREFERENCES,
          ...parsed,
          // Merge nested objects
          viewSettings: { ...DEFAULT_PREFERENCES.viewSettings, ...parsed.viewSettings },
          dashboardLayout: { ...DEFAULT_PREFERENCES.dashboardLayout, ...parsed.dashboardLayout }
        }));
      }
    } catch (error) {
      console.warn('Erro ao carregar preferências do hub:', error);
      // Usar preferências padrão em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar preferências no localStorage
  const savePreferences = useCallback((newPreferences: Partial<HubPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Erro ao salvar preferências do hub:', error);
    }
  }, [preferences]);

  // Funções específicas para diferentes tipos de preferências
  const updateLastActiveTab = useCallback((tab: HubViewMode) => {
    savePreferences({ lastActiveTab: tab });
  }, [savePreferences]);

  const updateSavedFilters = useCallback((filters: Partial<HubFilters>) => {
    savePreferences({ savedFilters: filters });
  }, [savePreferences]);

  const updateViewSettings = useCallback((settings: Partial<HubPreferences['viewSettings']>) => {
    savePreferences({
      viewSettings: { ...preferences.viewSettings, ...settings }
    });
  }, [savePreferences, preferences.viewSettings]);

  const updateDashboardLayout = useCallback((layout: Partial<HubPreferences['dashboardLayout']>) => {
    savePreferences({
      dashboardLayout: { ...preferences.dashboardLayout, ...layout }
    });
  }, [savePreferences, preferences.dashboardLayout]);

  const resetPreferences = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferences(DEFAULT_PREFERENCES);
    } catch (error) {
      console.warn('Erro ao resetar preferências:', error);
    }
  }, []);

  const exportPreferences = useCallback(() => {
    try {
      const dataStr = JSON.stringify(preferences, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hub-produtividade-preferences.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar preferências:', error);
    }
  }, [preferences]);

  const importPreferences = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          savePreferences(imported);
          resolve();
        } catch (error) {
          reject(new Error('Arquivo de preferências inválido'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, [savePreferences]);

  return {
    preferences,
    isLoading,
    updateLastActiveTab,
    updateSavedFilters,
    updateViewSettings,
    updateDashboardLayout,
    resetPreferences,
    exportPreferences,
    importPreferences,
    savePreferences
  };
} 