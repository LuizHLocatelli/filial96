import { CurriculoCard } from './CurriculoCard';
import type { Curriculo } from '@/types/curriculos';
import { FileX } from 'lucide-react';

interface CurriculosListProps {
  curriculos: Curriculo[];
  onView: (curriculo: Curriculo) => void;
  onDelete: (curriculo: Curriculo) => void;
  isLoading?: boolean;
}

export function CurriculosList({
  curriculos,
  onView,
  onDelete,
  isLoading
}: CurriculosListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted rounded-lg h-[300px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (curriculos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Nenhum currículo encontrado</h3>
        <p className="text-muted-foreground max-w-sm">
          Não há currículos cadastrados para os filtros selecionados.
          Clique em "Novo Currículo" para adicionar o primeiro.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {curriculos.map((curriculo) => (
        <CurriculoCard
          key={curriculo.id}
          curriculo={curriculo}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
