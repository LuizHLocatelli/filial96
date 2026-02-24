import { useState, useEffect, useCallback } from 'react';

export interface QuickActionPreferences {
  favorites: string[];
  customOrder: string[];
  usageStats: Record<string, { count: number; lastUsed: string }>;
  showOnlyFavorites: boolean;
  enableKeyboardShortcuts: boolean;
}

const DEFAULT_PREFERENCES: QuickActionPreferences = {
  favorites: [],
  customOrder: [],
  usageStats: {},
  showOnlyFavorites: false,
  enableKeyboardShortcuts: true
};

const STORAGE_KEY = 'hub-quick-action-preferences';

export function useQuickActionPreferences() {
  const [preferences, setPreferences] = useState<QuickActionPreferences>(DEFAULT_PREFERENCES);

  // Carregar preferências do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Erro ao carregar preferências das ações rápidas:', error);
    }
  }, []);

  // Salvar preferências no localStorage
  const savePreferences = useCallback((newPreferences: QuickActionPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Erro ao salvar preferências das ações rápidas:', error);
    }
  }, []);

  // Alternar favorito
  const toggleFavorite = useCallback((actionId: string) => {
    const newPreferences = { ...preferences };
    const index = newPreferences.favorites.indexOf(actionId);
    
    if (index >= 0) {
      newPreferences.favorites.splice(index, 1);
    } else {
      newPreferences.favorites.push(actionId);
    }
    
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Verificar se uma ação é favorita
  const isFavorite = useCallback((actionId: string) => {
    return preferences.favorites.includes(actionId);
  }, [preferences.favorites]);

  // Registrar uso de uma ação
  const trackUsage = useCallback((actionId: string) => {
    const newPreferences = { ...preferences };
    const currentStats = newPreferences.usageStats[actionId] || { count: 0, lastUsed: '' };
    
    newPreferences.usageStats[actionId] = {
      count: currentStats.count + 1,
      lastUsed: new Date().toISOString()
    };
    
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Reordenar ações
  const reorderActions = useCallback((newOrder: string[]) => {
    const newPreferences = { ...preferences, customOrder: newOrder };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Alternar exibição apenas de favoritos
  const toggleShowOnlyFavorites = useCallback(() => {
    const newPreferences = { 
      ...preferences, 
      showOnlyFavorites: !preferences.showOnlyFavorites 
    };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Alternar atalhos de teclado
  const toggleKeyboardShortcuts = useCallback(() => {
    const newPreferences = { 
      ...preferences, 
      enableKeyboardShortcuts: !preferences.enableKeyboardShortcuts 
    };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Resetar preferências
  const resetPreferences = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  // Obter ações mais usadas
  const getMostUsedActions = useCallback((limit: number = 5) => {
    return Object.entries(preferences.usageStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([actionId, stats]) => ({ actionId, ...stats }));
  }, [preferences.usageStats]);

  return {
    preferences,
    toggleFavorite,
    isFavorite,
    trackUsage,
    reorderActions,
    toggleShowOnlyFavorites,
    toggleKeyboardShortcuts,
    resetPreferences,
    getMostUsedActions,
    savePreferences
  };
} 