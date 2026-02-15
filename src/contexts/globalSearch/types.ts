export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'section' | 'file' | 'feature';
  path: string;
  section?: string;
  icon?: string;
}

export interface GlobalSearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  performSearch: (term: string) => void;
  clearSearch: () => void;
}
