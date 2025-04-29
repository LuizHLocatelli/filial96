
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Organizacao() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organização da Loja</h2>
          <p className="text-muted-foreground">
            Gerencie tarefas de organização de vitrines e setores da loja.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">
          Módulo de organização da loja em desenvolvimento
        </p>
        <Button>Implementar Funcionalidades</Button>
      </div>
    </div>
  );
}
