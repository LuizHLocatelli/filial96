import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, File, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import { QuickActionsSettings } from "./QuickActionsSettings";

interface QuickActionsProps {
  onNovaRotina: () => void;
  onNovaOrientacao: () => void;
  onNovaTarefa: () => void;
  onBuscaAvancada: () => void;
  onFiltrosPorData: () => void;
  onRelatorios: () => void;
  onRefreshData: () => void;
  onExportData: () => void;
}

export function QuickActions({
  onNovaRotina,
  onNovaOrientacao,
  onNovaTarefa,
  onBuscaAvancada,
  onFiltrosPorData,
  onRelatorios,
  onRefreshData,
  onExportData,
}: QuickActionsProps) {
  const { toast } = useToast();
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [showSettings, setShowSettings] = useState(false);

  const handlers = {
    onNovaRotina,
    onNovaOrientacao,
    onNovaTarefa,
    onBuscaAvancada,
    onFiltrosPorData,
    onRelatorios,
    onRefreshData,
    onExportData,
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">Ações rápidas</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              <span>Configurações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              Personalizar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Button variant="outline" onClick={onNovaRotina}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rotina
        </Button>
        <Button variant="outline" onClick={onNovaOrientacao}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Orientação
        </Button>
        <Button variant="outline" onClick={onNovaTarefa}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
        <Button variant="outline" onClick={onBuscaAvancada}>
          <Search className="h-4 w-4 mr-2" />
          Busca Avançada
        </Button>
        <Button variant="outline" onClick={onFiltrosPorData}>
          <Calendar className="h-4 w-4 mr-2" />
          Filtros por Data
        </Button>
        <Button variant="outline" onClick={onRelatorios}>
          <File className="h-4 w-4 mr-2" />
          Relatórios
        </Button>
        <Button variant="outline" onClick={onRefreshData}>
          <File className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
        <Button variant="outline" onClick={onExportData}>
          <File className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>

        <QuickActionsSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          handlers={handlers}
        />
      </div>
    </Card>
  );
}
