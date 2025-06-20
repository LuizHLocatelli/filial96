import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  RotateCcw,
  FileText,
  Clock,
  User,
  Tag,
  Check
} from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { useMobileDialog } from '@/hooks/useMobileDialog';

// Tipos para as propriedades
interface BuscaAvancadaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rotinas: Array<any>;
  orientacoes: Array<any>;
  tarefas: Array<any>;
  onResultsSelect: (results: SearchResults) => void;
}

interface SearchResults {
  rotinas: Array<any>;
  orientacoes: Array<any>;
  tarefas: Array<any>;
  totalFound: number;
  searchQuery: string;
  appliedFilters: SearchFilters;
}

interface SearchFilters {
  termo: string;
  tipos: string[];
  status: string[];
  categorias: string[];
  usuarios: string[];
  dateRange: DateRange | undefined;
  ordenacao: 'relevancia' | 'data-criacao' | 'data-atualizacao' | 'nome';
  direcao: 'asc' | 'desc';
}

const INITIAL_FILTERS: SearchFilters = {
  termo: '',
  tipos: [],
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
  rotinas, 
  orientacoes, 
  tarefas,
  onResultsSelect 
}: BuscaAvancadaProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Extrair valores únicos para os filtros
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    [...rotinas, ...orientacoes, ...tarefas].forEach(item => {
      if (item.categoria) categories.add(item.categoria);
    });
    return Array.from(categories).sort();
  }, [rotinas, orientacoes, tarefas]);

  const availableUsers = useMemo(() => {
    const users = new Set<string>();
    [...rotinas, ...orientacoes, ...tarefas].forEach(item => {
      if (item.created_by) users.add(item.created_by);
      if (item.usuario) users.add(item.usuario);
    });
    return Array.from(users).sort();
  }, [rotinas, orientacoes, tarefas]);

  const availableStatus = useMemo(() => {
    const status = new Set<string>();
    [...rotinas, ...orientacoes, ...tarefas].forEach(item => {
      if (item.status) status.add(item.status);
    });
    return Array.from(status).sort();
  }, [rotinas, orientacoes, tarefas]);

  // Função de busca com ranking por relevância
  const performSearch = () => {
    setIsSearching(true);
    
    setTimeout(() => {
      const searchTerm = filters.termo.toLowerCase();
      
      // Função para calcular score de relevância
      const calculateRelevance = (item: any, type: string) => {
        let score = 0;
        
        if (item.nome?.toLowerCase().includes(searchTerm)) score += 100;
        if (item.titulo?.toLowerCase().includes(searchTerm)) score += 100;
        if (item.descricao?.toLowerCase().includes(searchTerm)) score += 50;
        if (item.observacoes?.toLowerCase().includes(searchTerm)) score += 30;
        if (item.categoria?.toLowerCase().includes(searchTerm)) score += 20;
        
        // Bonus por tipo de correspondência
        if (item.nome?.toLowerCase() === searchTerm) score += 200;
        if (item.titulo?.toLowerCase() === searchTerm) score += 200;
        
        return score;
      };

      // Filtrar por termo de busca
      let filteredRotinas = rotinas.filter(item => {
        if (searchTerm && !Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchTerm)
        )) return false;
        return true;
      });

      let filteredOrientacoes = orientacoes.filter(item => {
        if (searchTerm && !Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchTerm)
        )) return false;
        return true;
      });

      let filteredTarefas = tarefas.filter(item => {
        if (searchTerm && !Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchTerm)
        )) return false;
        return true;
      });

      // Aplicar filtros adicionais
      if (filters.tipos.length > 0) {
        if (!filters.tipos.includes('rotinas')) filteredRotinas = [];
        if (!filters.tipos.includes('orientacoes')) filteredOrientacoes = [];
        if (!filters.tipos.includes('tarefas')) filteredTarefas = [];
      }

      if (filters.status.length > 0) {
        filteredRotinas = filteredRotinas.filter(item => filters.status.includes(item.status));
        filteredOrientacoes = filteredOrientacoes.filter(item => filters.status.includes(item.status || 'ativa'));
        filteredTarefas = filteredTarefas.filter(item => filters.status.includes(item.status));
      }

      if (filters.categorias.length > 0) {
        filteredRotinas = filteredRotinas.filter(item => filters.categorias.includes(item.categoria));
        filteredOrientacoes = filteredOrientacoes.filter(item => filters.categorias.includes(item.categoria));
        filteredTarefas = filteredTarefas.filter(item => filters.categorias.includes(item.categoria));
      }

      if (filters.usuarios.length > 0) {
        filteredRotinas = filteredRotinas.filter(item => 
          filters.usuarios.includes(item.created_by) || filters.usuarios.includes(item.usuario)
        );
        filteredOrientacoes = filteredOrientacoes.filter(item => 
          filters.usuarios.includes(item.created_by) || filters.usuarios.includes(item.usuario)
        );
        filteredTarefas = filteredTarefas.filter(item => 
          filters.usuarios.includes(item.created_by) || filters.usuarios.includes(item.usuario)
        );
      }

      // Filtro por data
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const startDate = startOfDay(filters.dateRange.from);
        const endDate = endOfDay(filters.dateRange.to);
        
        filteredRotinas = filteredRotinas.filter(item => {
          const itemDate = new Date(item.created_at || item.updated_at);
          return isWithinInterval(itemDate, { start: startDate, end: endDate });
        });
        
        filteredOrientacoes = filteredOrientacoes.filter(item => {
          const itemDate = new Date(item.created_at || item.updated_at);
          return isWithinInterval(itemDate, { start: startDate, end: endDate });
        });
        
        filteredTarefas = filteredTarefas.filter(item => {
          const itemDate = new Date(item.created_at || item.updated_at);
          return isWithinInterval(itemDate, { start: startDate, end: endDate });
        });
      }

      // Ordenar por relevância ou outros critérios
      if (filters.ordenacao === 'relevancia' && searchTerm) {
        filteredRotinas = filteredRotinas
          .map(item => ({ ...item, _relevance: calculateRelevance(item, 'rotina') }))
          .sort((a, b) => b._relevance - a._relevance);
        
        filteredOrientacoes = filteredOrientacoes
          .map(item => ({ ...item, _relevance: calculateRelevance(item, 'orientacao') }))
          .sort((a, b) => b._relevance - a._relevance);
        
        filteredTarefas = filteredTarefas
          .map(item => ({ ...item, _relevance: calculateRelevance(item, 'tarefa') }))
          .sort((a, b) => b._relevance - a._relevance);
      } else {
        // Outras ordenações
        const sortFunction = (a: any, b: any) => {
          let aValue, bValue;
          
          switch (filters.ordenacao) {
            case 'nome':
              aValue = a.nome || a.titulo || '';
              bValue = b.nome || b.titulo || '';
              break;
            case 'data-criacao':
              aValue = new Date(a.created_at);
              bValue = new Date(b.created_at);
              break;
            case 'data-atualizacao':
              aValue = new Date(a.updated_at || a.created_at);
              bValue = new Date(b.updated_at || b.created_at);
              break;
            default:
              return 0;
          }
          
          if (typeof aValue === 'string') {
            return filters.direcao === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          } else {
            return filters.direcao === 'asc' 
              ? aValue - bValue 
              : bValue - aValue;
          }
        };

        filteredRotinas.sort(sortFunction);
        filteredOrientacoes.sort(sortFunction);
        filteredTarefas.sort(sortFunction);
      }

      const results: SearchResults = {
        rotinas: filteredRotinas,
        orientacoes: filteredOrientacoes,
        tarefas: filteredTarefas,
        totalFound: filteredRotinas.length + filteredOrientacoes.length + filteredTarefas.length,
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
    if (filters.tipos.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.categorias.length > 0) count++;
    if (filters.usuarios.length > 0) count++;
    if (filters.dateRange?.from) count++;
    return count;
  }, [filters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("extraLarge")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Busca Avançada
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Encontre orientações, tarefas, consultores e rotinas rapidamente
          </DialogDescription>
        </DialogHeader>

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

            {/* Tipos */}
            <div className="space-y-2">
              <Label>Tipos de Conteúdo</Label>
              <div className="space-y-2">
                {[
                  { id: 'rotinas', label: 'Rotinas', icon: Clock },
                  { id: 'orientacoes', label: 'Orientações', icon: FileText },
                  { id: 'tarefas', label: 'Tarefas', icon: Check }
                ].map(tipo => (
                  <div key={tipo.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tipo.id}
                      checked={filters.tipos.includes(tipo.id)}
                      onCheckedChange={() => toggleArrayFilter('tipos', tipo.id)}
                    />
                    <Label htmlFor={tipo.id} className="flex items-center gap-2 cursor-pointer">
                      <tipo.icon className="h-4 w-4" />
                      {tipo.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            {availableStatus.length > 0 && (
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="space-y-2">
                  {availableStatus.map(status => (
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
            )}

            {/* Categorias */}
            {availableCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Categorias</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableCategories.map(categoria => (
                    <div key={categoria} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${categoria}`}
                        checked={filters.categorias.includes(categoria)}
                        onCheckedChange={() => toggleArrayFilter('categorias', categoria)}
                      />
                      <Label htmlFor={`cat-${categoria}`} className="cursor-pointer">
                        <Badge variant="outline">{categoria}</Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

                {/* Rotinas */}
                {searchResults.rotinas.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4" />
                        Rotinas ({searchResults.rotinas.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {searchResults.rotinas.slice(0, 5).map(rotina => (
                        <div key={rotina.id} className="p-3 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{rotina.nome}</h4>
                            <Badge variant={rotina.status === 'concluida' ? 'default' : 'secondary'}>
                              {rotina.status}
                            </Badge>
                          </div>
                          {rotina.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {rotina.descricao.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      ))}
                      {searchResults.rotinas.length > 5 && (
                        <p className="text-center text-sm text-muted-foreground">
                          +{searchResults.rotinas.length - 5} rotinas adicionais
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Orientações */}
                {searchResults.orientacoes.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        Orientações ({searchResults.orientacoes.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {searchResults.orientacoes.slice(0, 5).map(orientacao => (
                        <div key={orientacao.id} className="p-3 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{orientacao.titulo}</h4>
                            <Badge variant="outline">{orientacao.categoria}</Badge>
                          </div>
                          {orientacao.conteudo && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {orientacao.conteudo.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      ))}
                      {searchResults.orientacoes.length > 5 && (
                        <p className="text-center text-sm text-muted-foreground">
                          +{searchResults.orientacoes.length - 5} orientações adicionais
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tarefas */}
                {searchResults.tarefas.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Check className="h-4 w-4" />
                        Tarefas ({searchResults.tarefas.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {searchResults.tarefas.slice(0, 5).map(tarefa => (
                        <div key={tarefa.id} className="p-3 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{tarefa.titulo}</h4>
                            <Badge variant={tarefa.status === 'concluida' ? 'default' : 'secondary'}>
                              {tarefa.status}
                            </Badge>
                          </div>
                          {tarefa.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {tarefa.descricao.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      ))}
                      {searchResults.tarefas.length > 5 && (
                        <p className="text-center text-sm text-muted-foreground">
                          +{searchResults.tarefas.length - 5} tarefas adicionais
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {searchResults.totalFound === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar seus filtros ou usar termos diferentes.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pronto para buscar</h3>
                <p className="text-muted-foreground">
                  Configure seus filtros e clique em "Buscar" para encontrar o que precisa.
                </p>
              </div>
            )}
          </div>
        </div>

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
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
            >
              <Search className="h-4 w-4 mr-2" />
              Aplicar Resultados
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 