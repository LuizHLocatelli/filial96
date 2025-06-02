
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  Search, 
  Calendar as CalendarIcon, 
  X,
  RotateCcw,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

// Tipos para os filtros
export interface FilterState {
  search: string;
  status: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  categoria: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface MobileFiltersProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  trigger?: React.ReactNode;
}

const statusOptions = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'atrasada', label: 'Atrasada' }
];

const categoriaOptions = [
  { value: 'todas', label: 'Todas as categorias' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'organizacao', label: 'Organização' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'administrativa', label: 'Administrativa' }
];

const sortOptions = [
  { value: 'data', label: 'Data de criação' },
  { value: 'prazo', label: 'Prazo' },
  { value: 'prioridade', label: 'Prioridade' },
  { value: 'alfabetica', label: 'Ordem alfabética' }
];

export function MobileFilters({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  trigger
}: MobileFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: filters.dateRange.from,
    to: filters.dateRange.to
  });

  // Sincronizar filtros locais quando os externos mudarem
  useEffect(() => {
    setLocalFilters(filters);
    setDateRange({
      from: filters.dateRange.from,
      to: filters.dateRange.to
    });
  }, [filters]);

  const handleLocalFilterChange = (key: keyof FilterState, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = Array.isArray(localFilters.status) ? localFilters.status : [];
    
    if (checked) {
      handleLocalFilterChange('status', [...currentStatus, status]);
    } else {
      handleLocalFilterChange('status', currentStatus.filter(s => s !== status));
    }
  };

  const handleCategoriaChange = (categoria: string, checked: boolean) => {
    const currentCategoria = Array.isArray(localFilters.categoria) ? localFilters.categoria : [];
    
    if (checked) {
      handleLocalFilterChange('categoria', [...currentCategoria, categoria]);
    } else {
      handleLocalFilterChange('categoria', currentCategoria.filter(c => c !== categoria));
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    handleLocalFilterChange('dateRange', {
      from: range?.from,
      to: range?.to
    });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const resetFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      status: [],
      dateRange: {},
      categoria: [],
      sortBy: 'data',
      sortOrder: 'desc'
    };
    setLocalFilters(emptyFilters);
    setDateRange(undefined);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.status.length > 0) count++;
    if (localFilters.dateRange.from || localFilters.dateRange.to) count++;
    if (localFilters.categoria.length > 0) count++;
    return count;
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Filter className="h-4 w-4" />
      Filtros
      {hasActiveFilters && (
        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
          {getActiveFiltersCount()}
        </Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
            </SheetTitle>
            {hasActiveFilters && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} filtros ativos
              </Badge>
            )}
          </div>

          {/* Busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar em tudo..."
                value={localFilters.search}
                onChange={(e) => handleLocalFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Status */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Status</Label>
            <div className="space-y-2">
              {statusOptions.slice(1).map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={localFilters.status.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(option.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`status-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Período */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Período</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM yyyy", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy", { locale: ptBR })
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
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={1}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          {/* Categoria */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Categoria</Label>
            <div className="space-y-2">
              {categoriaOptions.slice(1).map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`categoria-${option.value}`}
                    checked={localFilters.categoria.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleCategoriaChange(option.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`categoria-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ordenação */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Ordenação</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sortBy" className="text-sm">Ordenar por</Label>
                <Select 
                  value={localFilters.sortBy} 
                  onValueChange={(value) => handleLocalFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="text-sm">Ordem</Label>
                <Select 
                  value={localFilters.sortOrder} 
                  onValueChange={(value: 'asc' | 'desc') => handleLocalFilterChange('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Mais recente</SelectItem>
                    <SelectItem value="asc">Mais antigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar
          </Button>
          <Button
            onClick={applyFilters}
            className="flex-1 gap-2"
          >
            <Check className="h-4 w-4" />
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
