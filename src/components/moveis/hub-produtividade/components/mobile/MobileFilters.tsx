import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Filter,
  X,
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  RotateCcw,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilterState {
  search: string;
  status: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  categoria: string[];
  prioridade: string[];
  responsavel: string[];
  showCompleted: boolean;
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

interface FilterSection {
  id: string;
  title: string;
  icon: React.ElementType;
  expanded: boolean;
}

const statusOptions = [
  { value: 'pendente', label: 'Pendente', icon: Clock, color: 'text-yellow-600' },
  { value: 'andamento', label: 'Em Andamento', icon: AlertCircle, color: 'text-blue-600' },
  { value: 'concluida', label: 'Concluída', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'atrasada', label: 'Atrasada', icon: AlertCircle, color: 'text-red-600' }
];

const categoriaOptions = [
  'Rotinas Obrigatórias',
  'Orientações Gerais',
  'Tarefas Específicas',
  'Procedimentos',
  'Treinamentos',
  'Manutenções'
];

const prioridadeOptions = [
  { value: 'baixa', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-red-100 text-red-800' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-200 text-red-900' }
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
  const { isMobile } = useResponsive();
  const [expandedSections, setExpandedSections] = useState<string[]>(['search', 'status']);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="relative">
      <Filter className="h-4 w-4 mr-2" />
      Filtros
      {hasActiveFilters && (
        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
          !
        </Badge>
      )}
    </Button>
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'status' | 'categoria' | 'prioridade' | 'responsavel', value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.categoria.length > 0) count++;
    if (filters.prioridade.length > 0) count++;
    if (filters.responsavel.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (!filters.showCompleted) count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6 p-4">
      {/* Header com contador de filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Filtros</h3>
          <p className="text-sm text-muted-foreground">
            {getActiveFiltersCount()} filtro(s) ativo(s)
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>

      {/* Busca */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('search')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="font-medium">Busca</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            expandedSections.includes('search') ? "rotate-180" : ""
          )} />
        </button>
        
        {expandedSections.includes('search') && (
          <div className="pl-6 space-y-3">
            <Input
              placeholder="Buscar em tudo..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Status */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('status')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500" />
            <span className="font-medium">Status</span>
            {filters.status.length > 0 && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                {filters.status.length}
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            expandedSections.includes('status') ? "rotate-180" : ""
          )} />
        </button>
        
        {expandedSections.includes('status') && (
          <div className="pl-6 space-y-2">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center",
                    filters.status.includes(option.value)
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  )}>
                    {filters.status.includes(option.value) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <option.icon className={cn("h-4 w-4", option.color)} />
                  <span className="text-sm">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Período */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('periodo')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="font-medium">Período</span>
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                Ativo
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            expandedSections.includes('periodo') ? "rotate-180" : ""
          )} />
        </button>
        
        {expandedSections.includes('periodo') && (
          <div className="pl-6 space-y-3">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecionar período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(range) => updateFilter('dateRange', range || {})}
                  numberOfMonths={1}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <Separator />

      {/* Categoria */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('categoria')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gradient-to-r from-purple-400 to-pink-500" />
            <span className="font-medium">Categoria</span>
            {filters.categoria.length > 0 && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                {filters.categoria.length}
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            expandedSections.includes('categoria') ? "rotate-180" : ""
          )} />
        </button>
        
        {expandedSections.includes('categoria') && (
          <div className="pl-6 space-y-2">
            {categoriaOptions.map((categoria) => (
              <label
                key={categoria}
                className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-accent"
              >
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center",
                  filters.categoria.includes(categoria)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                )}>
                  {filters.categoria.includes(categoria) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm">{categoria}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Configurações */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('config')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gradient-to-r from-orange-400 to-red-500" />
            <span className="font-medium">Configurações</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            expandedSections.includes('config') ? "rotate-180" : ""
          )} />
        </button>
        
        {expandedSections.includes('config') && (
          <div className="pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-completed">Mostrar concluídos</Label>
              <Switch
                id="show-completed"
                checked={filters.showCompleted}
                onCheckedChange={(checked) => updateFilter('showCompleted', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Ordenar por</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar ordenação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="prioridade">Prioridade</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="titulo">Título</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex-1"
          disabled={!hasActiveFilters}
        >
          Limpar Filtros
        </Button>
        <Button
          onClick={() => onOpenChange(false)}
          className="flex-1"
        >
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          {trigger || defaultTrigger}
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Filtros Avançados</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <FilterContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-full">
          <FilterContent />
        </div>
      </SheetContent>
    </Sheet>
  );
} 