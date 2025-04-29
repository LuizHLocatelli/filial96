
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Cobrancas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cobrança de Inadimplentes</h2>
          <p className="text-muted-foreground">
            Gerenciamento de cobranças para clientes inadimplentes.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Cobrança
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">
          Módulo de cobrança em desenvolvimento
        </p>
        <Button>Implementar Funcionalidades</Button>
      </div>
    </div>
  );
}
