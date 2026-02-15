import React, { useState, ReactNode } from 'react';
import { GlobalSearchContext } from './GlobalSearchContext';
import { searchableItems } from './searchableItems';

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof searchableItems>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setTimeout(() => {
      const searchLower = term.toLowerCase();
      const results = searchableItems.filter(item => (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.section && item.section.toLowerCase().includes(searchLower))
      ));
      
      results.sort((a, b) => {
        const aExact = a.title.toLowerCase() === searchLower ? 1 : 0;
        const bExact = b.title.toLowerCase() === searchLower ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        
        const aStartsWith = a.title.toLowerCase().startsWith(searchLower) ? 1 : 0;
        const bStartsWith = b.title.toLowerCase().startsWith(searchLower) ? 1 : 0;
        return bStartsWith - aStartsWith;
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <GlobalSearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        performSearch,
        clearSearch
      }}
    >
      {children}
    </GlobalSearchContext.Provider>
  );
}
