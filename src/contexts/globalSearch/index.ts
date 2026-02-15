import { useContext } from 'react';
import { GlobalSearchContext } from './GlobalSearchContext';
import { GlobalSearchProvider } from './GlobalSearchProvider';

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (context === undefined) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
  }
  return context;
}

export { GlobalSearchProvider, GlobalSearchContext };
export type { SearchResult, GlobalSearchContextType } from './types';
export { searchableItems } from './searchableItems';
