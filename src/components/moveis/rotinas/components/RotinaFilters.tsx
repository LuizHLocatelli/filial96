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
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="periodicidade-filter" className="text-sm font-medium whitespace-nowrap">
              Período:
            </Label>
            <Select value={periodicidadeFilter} onValueChange={onPeriodicidadeChange}>
              <SelectTrigger className="w-full sm:w-32">
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="status-filter" className="text-sm font-medium whitespace-nowrap">
              Status:
            </Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-32">
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="categoria-filter" className="text-sm font-medium whitespace-nowrap">
              Categoria:
            </Label>
            <Select value={categoriaFilter} onValueChange={onCategoriaChange}>
              <SelectTrigger className="w-full sm:w-36">
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
            <div className="w-full sm:w-auto sm:ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1 w-full sm:w-auto"
              >
                <X className="h-3 w-3" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
