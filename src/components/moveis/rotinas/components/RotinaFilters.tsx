
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { PeriodicidadeFilter, StatusFilter } from '../types';

interface RotinaFiltersProps {
  periodicidadeFilter: PeriodicidadeFilter;
  statusFilter: StatusFilter;
  categoriaFilter: string;
  categorias: string[];
  onPeriodicidadeChange: (value: PeriodicidadeFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCategoriaChange: (value: string) => void;
}

export function RotinaFilters({
  periodicidadeFilter,
  statusFilter,
  categoriaFilter,
  categorias,
  onPeriodicidadeChange,
  onStatusChange,
  onCategoriaChange,
}: RotinaFiltersProps) {
  const clearFilters = () => {
    onPeriodicidadeChange('todos');
    onStatusChange('todos');
    onCategoriaChange('todos');
  };

  const hasActiveFilters = periodicidadeFilter !== 'todos' || statusFilter !== 'todos' || categoriaFilter !== 'todos';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="periodicidade-filter" className="text-sm font-medium">
              Período:
            </Label>
            <Select value={periodicidadeFilter} onValueChange={onPeriodicidadeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">
              Status:
            </Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="categoria-filter" className="text-sm font-medium">
              Categoria:
            </Label>
            <Select value={categoriaFilter} onValueChange={onCategoriaChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
