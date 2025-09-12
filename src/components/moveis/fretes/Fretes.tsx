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
  const [editingFrete, setEditingFrete] = useState<Frete | null>(null);

  const handleFreteClick = (frete: Frete) => {
    setSelectedFrete(frete);
    setDetalhesOpen(true);
  };

  const handleFreteCreated = () => {
    setDialogOpen(false);
    setEditingFrete(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditFrete = (frete: Frete) => {
    setEditingFrete(frete);
    setDialogOpen(true);
  };

  const handleFreteUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    setSelectedFrete(null);
    setDetalhesOpen(false);
  };

  const handleNewFrete = () => {
    setEditingFrete(null);
    setDialogOpen(true);
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
        
        <Button onClick={handleNewFrete}>
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
        editingFrete={editingFrete}
      />

      <FreteDetalhes
        frete={selectedFrete}
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
        onFreteUpdated={handleFreteUpdated}
        onEditFrete={handleEditFrete}
      />
    </div>
  );
}