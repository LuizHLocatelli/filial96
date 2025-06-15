
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
    { value: 'all', label: '📦 Todas as Categorias' },
    { value: 'Linha Branca', label: '🏠 Linha Branca' },
    { value: 'Som e Imagem', label: '📺 Som e Imagem' },
    { value: 'Telefonia', label: '📱 Telefonia' },
    { value: 'Linha Móveis', label: '🛋️ Linha Móveis' },
    { value: 'Eletroportáteis', label: '⚡ Eletroportáteis' },
    { value: 'Tecnologia', label: '💻 Tecnologia' },
    { value: 'Automotivo', label: '🚗 Automotivo' }
  ];

  const ordenacaoOptions = [
    { value: 'mais_recentes', label: '🕒 Mais Recentes' },
    { value: 'nome', label: '🔤 Alfabética' },
    { value: 'preco_asc', label: '💰 Menor Preço' },
    { value: 'preco_desc', label: '💎 Maior Preço' }
  ];

  const updateFilters = (key: keyof DescontinuadosFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="border-0 bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Filtros de Busca
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Busca Rápida
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Nome ou código..."
                value={filters.search}
                onChange={(e) => updateFilters('search', e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm"
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Categoria
            </Label>
            <Select value={filters.categoria} onValueChange={(value) => updateFilters('categoria', value)}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-gray-200/50 dark:border-gray-600/30 shadow-lg">
                {categorias.map((categoria) => (
                  <SelectItem 
                    key={categoria.value} 
                    value={categoria.value}
                    className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50"
                  >
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ordenação */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ordenar por
            </Label>
            <Select value={filters.ordenacao} onValueChange={(value) => updateFilters('ordenacao', value)}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-gray-200/50 dark:border-gray-600/30 shadow-lg">
                {ordenacaoOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Faixa de Preço */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Faixa de Preço
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.preco_min || ''}
                onChange={(e) => updateFilters('preco_min', e.target.value ? Number(e.target.value) : undefined)}
                className="h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.preco_max || ''}
                onChange={(e) => updateFilters('preco_max', e.target.value ? Number(e.target.value) : undefined)}
                className="h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
