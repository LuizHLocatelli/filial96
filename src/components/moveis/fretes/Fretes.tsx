import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FretesList } from "./FretesList";
import { FreteDialog } from "./FreteDialog";
import { FreteDetalhes } from "./FreteDetalhes";
import { Frete } from "@/types/frete";

export function Fretes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFrete, setSelectedFrete] = useState<Frete | null>(null);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFreteClick = (frete: Frete) => {
    setSelectedFrete(frete);
    setDetalhesOpen(true);
  };

  const handleFreteCreated = () => {
    setDialogOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fretes</h1>
          <p className="text-muted-foreground">
            Gerencie os fretes e entregas
          </p>
        </div>
        
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Frete
        </Button>
      </div>

      <FretesList 
        onFreteClick={handleFreteClick}
        refreshTrigger={refreshTrigger}
      />

      <FreteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onFreteCreated={handleFreteCreated}
      />

      <FreteDetalhes
        frete={selectedFrete}
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
      />
    </div>
  );
}