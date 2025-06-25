import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, DollarSign } from 'lucide-react';
import { DescontinuadosFilters } from '@/types/descontinuados';

interface FiltrosDescontinuadosProps {
  filters: DescontinuadosFilters;
  onFiltersChange: (filters: DescontinuadosFilters) => void;
}

export function FiltrosDescontinuados({ filters, onFiltersChange }: FiltrosDescontinuadosProps) {
  const categorias = [
    { value: 'all', label: '📦 Todas' },
    { value: 'Linha Branca', label: '🏠 Linha Branca' },
    { value: 'Som e Imagem', label: '📺 Som e Imagem' },
    { value: 'Telefonia', label: '📱 Telefonia' },
    { value: 'Linha Móveis', label: '🛋️ Móveis' },
    { value: 'Eletroportáteis', label: '⚡ Eletroportáteis' },
    { value: 'Tecnologia', label: '💻 Tecnologia' },
    { value: 'Automotivo', label: '🚗 Automotivo' }
  ];

  const ordenacaoOptions = [
    { value: 'mais_recentes', label: '🕒 Recentes' },
    { value: 'nome', label: '🔤 Alfabética' },
    { value: 'preco_asc', label: '💰 Menor Preço' },
    { value: 'preco_desc', label: '💎 Maior Preço' }
  ];

  const updateFilters = (key: keyof DescontinuadosFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="border-2 border-border bg-background shadow-soft">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary border-2 border-primary/20 rounded-full flex items-center justify-center shadow-soft">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Filtros
          </h3>
        </div>

        <div className="stack-sm sm:grid-responsive-stats sm:stack-none">
          {/* Busca */}
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-foreground">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder="Nome ou código..."
                value={filters.search}
                onChange={(e) => updateFilters('search', e.target.value)}
                className="pl-8 sm:pl-10 h-8 sm:h-11 text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-border bg-background shadow-soft"
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-foreground">
              Categoria
            </Label>
            <Select value={filters.categoria} onValueChange={(value) => updateFilters('categoria', value)}>
              <SelectTrigger className="h-8 sm:h-11 text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-border bg-background shadow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg sm:rounded-xl bg-background border-2 border-border shadow-medium">
                {categorias.map((categoria) => (
                  <SelectItem 
                    key={categoria.value} 
                    value={categoria.value}
                    className="text-xs sm:text-sm focus:bg-muted"
                  >
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ordenação */}
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-foreground">
              Ordenar
            </Label>
            <Select value={filters.ordenacao} onValueChange={(value) => updateFilters('ordenacao', value)}>
              <SelectTrigger className="h-8 sm:h-11 text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-border bg-background shadow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg sm:rounded-xl bg-background border-2 border-border shadow-medium">
                {ordenacaoOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-xs sm:text-sm focus:bg-muted"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Faixa de Preço */}
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1 sm:gap-2">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
              Preço
            </Label>
            <div className="flex gap-1 sm:gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.preco_min || ''}
                onChange={(e) => updateFilters('preco_min', e.target.value ? Number(e.target.value) : undefined)}
                className="h-8 sm:h-11 text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-border bg-background shadow-soft"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.preco_max || ''}
                onChange={(e) => updateFilters('preco_max', e.target.value ? Number(e.target.value) : undefined)}
                className="h-8 sm:h-11 text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-border bg-background shadow-soft"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
