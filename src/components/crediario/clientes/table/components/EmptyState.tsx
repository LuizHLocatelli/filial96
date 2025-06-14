
import { AlertTriangle } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
      <p>Nenhum cliente encontrado com os filtros aplicados</p>
    </div>
  );
}
