
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface QuickActionsSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlers: {
    onNovaRotina: () => void;
    onNovaOrientacao: () => void;
    onNovaTarefa: () => void;
    onBuscaAvancada: () => void;
    onFiltrosPorData: () => void;
    onRelatorios: () => void;
    onRefreshData: () => void;
    onExportData: () => void;
  };
}

export function QuickActionsSettings({ open, onOpenChange, handlers }: QuickActionsSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Ações Rápidas
          </DialogTitle>
          <DialogDescription>
            Configure as ações rápidas disponíveis no hub de produtividade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handlers.onNovaRotina}>
              Nova Rotina
            </Button>
            <Button variant="outline" onClick={handlers.onNovaOrientacao}>
              Nova Orientação
            </Button>
            <Button variant="outline" onClick={handlers.onNovaTarefa}>
              Nova Tarefa
            </Button>
            <Button variant="outline" onClick={handlers.onBuscaAvancada}>
              Busca Avançada
            </Button>
            <Button variant="outline" onClick={handlers.onFiltrosPorData}>
              Filtros por Data
            </Button>
            <Button variant="outline" onClick={handlers.onRelatorios}>
              Relatórios
            </Button>
            <Button variant="outline" onClick={handlers.onRefreshData}>
              Atualizar Dados
            </Button>
            <Button variant="outline" onClick={handlers.onExportData}>
              Exportar Dados
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
