
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrientacoesEmptyStateProps {
  hasFilters: boolean;
}

export function OrientacoesEmptyState({ hasFilters }: OrientacoesEmptyStateProps) {
  const isMobile = useIsMobile();

  return (
    <div className="text-center py-8">
      <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">
        {hasFilters ? "Nenhuma orientação encontrada" : "Nenhuma orientação ainda"}
      </h3>
      <p className="text-muted-foreground mb-4 text-sm px-4">
        {hasFilters 
          ? "Tente ajustar os filtros de busca"
          : "Comece criando sua primeira orientação"
        }
      </p>
      <Button size={isMobile ? "default" : "lg"}>
        <Plus className="h-4 w-4 mr-2" />
        Nova Orientação
      </Button>
    </div>
  );
}
