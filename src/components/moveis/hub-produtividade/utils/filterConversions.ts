
import { FilterState } from '../components/mobile/MobileFilters';
import { HubFilters } from '../types';

export function convertToMobileFilters(
  searchTerm: string,
  filters: HubFilters
): FilterState {
  return {
    search: searchTerm,
    status: filters.status === 'todos' ? [] : [filters.status],
    dateRange: {
      from: filters.dateRange.start,
      to: filters.dateRange.end
    },
    categoria: filters.categoria === 'todos' ? [] : [filters.categoria],
    sortBy: 'data',
    sortOrder: 'desc' as const
  };
}

export function convertFromMobileFilters(
  mobileFilters: FilterState,
  setSearchTerm: (term: string) => void,
  setFilterSearchTerm: (term: string) => void
): void {
  setSearchTerm(mobileFilters.search);
  setFilterSearchTerm(mobileFilters.search);
  
  // TODO: Implementar conversão completa dos outros filtros
  // quando o hook useHubFilters for atualizado para suportar
  console.log('Mobile filters updated:', mobileFilters);
}
