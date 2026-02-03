import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  RotateCcw,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface BuscaAvancadaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResultsSelect: (results: SearchResults) => void;
}

interface SearchResults {
  items: Array<any>;
  totalFound: number;
  searchQuery: string;
  appliedFilters: SearchFilters;
}

interface SearchFilters {
  termo: string;
  status: string[];
  categorias: string[];
  usuarios: string[];
  dateRange: DateRange | undefined;
  ordenacao: 'relevancia' | 'data-criacao' | 'data-atualizacao' | 'nome';
  direcao: 'asc' | 'desc';
}

const INITIAL_FILTERS: SearchFilters = {
  termo: '',
  status: [],
  categorias: [],
  usuarios: [],
  dateRange: undefined,
  ordenacao: 'relevancia',
  direcao: 'desc'
};

export function BuscaAvancada({ 
  open, 
  onOpenChange, 
  onResultsSelect 
}: BuscaAvancadaProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Função de busca com ranking por relevância
  const performSearch = () => {
    setIsSearching(true);
    
    setTimeout(() => {
      // Sem dados de orientações, retornar resultados vazios
      const results: SearchResults = {
        items: [],
        totalFound: 0,
        searchQuery: filters.termo,
        appliedFilters: filters
      };

      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchResults(null);
  };

  const toggleArrayFilter = (filterKey: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: (prev[filterKey] as string[]).includes(value)
        ? (prev[filterKey] as string[]).filter(item => item !== value)
        : [...(prev[filterKey] as string[]), value]
    }));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.termo) count++;
    if (filters.status.length > 0) count++;
    if (filters.categorias.length > 0) count++;
    if (filters.usuarios.length > 0) count++;
    if (filters.dateRange?.from) count++;
    return count;
  }, [filters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("extraLarge")}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <Search className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                Busca Avançada
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              Funcionalidade de busca temporariamente indisponível
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Filtros */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros</h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Limpar
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                </Button>
              )}
            </div>

            {/* Termo de busca */}
            <div className="space-y-2">
              <Label htmlFor="search-term">Termo de Busca</Label>
              <Input
                id="search-term"
                placeholder="Digite sua pesquisa..."
                value={filters.termo}
                onChange={(e) => setFilters(prev => ({ ...prev, termo: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="space-y-2">
                {['ativo', 'inativo', 'pendente'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status)}
                      onCheckedChange={() => toggleArrayFilter('status', status)}
                    />
                    <Label htmlFor={`status-${status}`} className="cursor-pointer capitalize">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Período */}
            <div className="space-y-2">
              <Label>Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      "Selecionar período"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange}
                    onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <Label>Ordenar por</Label>
              <Select
                value={filters.ordenacao}
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, ordenacao: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevancia">Relevância</SelectItem>
                  <SelectItem value="data-criacao">Data de Criação</SelectItem>
                  <SelectItem value="data-atualizacao">Última Atualização</SelectItem>
                  <SelectItem value="nome">Nome/Título</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.direcao}
                onValueChange={(value: 'asc' | 'desc') => setFilters(prev => ({ ...prev, direcao: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Decrescente</SelectItem>
                  <SelectItem value="asc">Crescente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={performSearch} className="w-full" disabled={isSearching}>
              {isSearching ? (
                <>Buscando...</>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2 space-y-4">
            {searchResults ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Resultados ({searchResults.totalFound})
                  </h3>
                  <Button
                    onClick={() => onResultsSelect(searchResults)}
                    variant="outline"
                    size="sm"
                  >
                    Aplicar Resultados
                  </Button>
                </div>

                {searchResults.totalFound === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-muted-foreground">
                      Não há dados disponíveis para busca.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pronto para buscar</h3>
                <p className="text-muted-foreground">
                  Configure seus filtros e clique em "Buscar".
                </p>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div {...getMobileFooterProps()}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Fechar
          </Button>
          {searchResults && searchResults.totalFound > 0 && (
            <Button
              onClick={() => onResultsSelect(searchResults)}
              variant="success"
              size="default"
            >
              <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Aplicar Resultados
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
