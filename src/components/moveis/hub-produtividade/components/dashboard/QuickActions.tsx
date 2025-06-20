import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, FileText, Calendar, RotateCcw, Download, Target, BookOpen, ListTodo, Filter, BarChart3 } from "lucide-react";
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
  onShowFilters?: () => void;
  isRefreshing?: boolean;
  hideHeader?: boolean;
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
  onShowFilters,
  isRefreshing = false,
  hideHeader = false,
}: QuickActionsProps) {
  const { toast } = useToast();
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [showSettings, setShowSettings] = useState(false);

  // Handlers com debugging e feedback visual
  const handleActionClick = (actionName: string, actionFn: () => void) => {
    console.log(`🚀 Ação clicada: ${actionName}`);
    
    try {
      actionFn();
      toast({
        title: "Ação executada",
        description: `${actionName} foi acionada com sucesso!`,
        duration: 2000,
      });
    } catch (error) {
      console.error(`❌ Erro ao executar ${actionName}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao executar ${actionName}. Tente novamente.`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

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
    <Card className="w-full interactive-card">
      {!hideHeader && (
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border-2 border-primary/20">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Ações Rápidas</CardTitle>
              <p className="text-sm text-muted-foreground">Acelere seu fluxo de trabalho</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="selectable-item">
                <Settings className="h-4 w-4 mr-2" />
                <span>Configurações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                Personalizar Ações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      )}
      <CardContent className="pt-6">
        {/* Seção: Criar Novo Conteúdo */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Novo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              variant="success" 
              size="default" 
              onClick={() => handleActionClick("Nova Rotina", onNovaRotina)} 
              disabled={isRefreshing}
              className="h-12 justify-start"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Nova Rotina</div>
                <div className="text-xs opacity-80">Criar fluxo de trabalho</div>
              </div>
            </Button>
            <Button 
              variant="action" 
              size="default" 
              onClick={() => handleActionClick("Nova Orientação", onNovaOrientacao)} 
              disabled={isRefreshing}
              className="h-12 justify-start"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Nova Orientação</div>
                <div className="text-xs opacity-80">Documentar processo</div>
              </div>
            </Button>
            <Button 
              variant="primary-outline" 
              size="default" 
              onClick={() => handleActionClick("Nova Tarefa", onNovaTarefa)} 
              disabled={isRefreshing}
              className="h-12 justify-start"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Nova Tarefa</div>
                <div className="text-xs opacity-80">Definir atividade</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Seção: Pesquisar e Filtrar */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Pesquisar e Filtrar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => handleActionClick("Busca Avançada", onBuscaAvancada)} 
              disabled={isRefreshing}
              className="h-12 justify-start selectable-item"
            >
              <Search className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Busca Avançada</div>
                <div className="text-xs text-muted-foreground">Localizar conteúdo específico</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => handleActionClick("Filtros por Data", onFiltrosPorData)} 
              disabled={isRefreshing}
              className="h-12 justify-start selectable-item"
            >
              <Filter className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Filtros por Data</div>
                <div className="text-xs text-muted-foreground">Organizar por período</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Seção: Relatórios e Dados */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios e Dados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="primary" 
              size="default" 
              onClick={() => handleActionClick("Relatórios", onRelatorios)} 
              disabled={isRefreshing}
              className="h-10"
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => handleActionClick("Atualizar Dados", onRefreshData)} 
              disabled={isRefreshing}
              className="h-10 selectable-item"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => handleActionClick("Exportar Dados", onExportData)} 
              disabled={isRefreshing}
              className="h-10 selectable-item"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            {onShowFilters && (
              <Button 
                variant="ghost" 
                size="default" 
                onClick={() => handleActionClick("Mostrar Filtros", onShowFilters)} 
                disabled={isRefreshing}
                className="h-10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            )}
          </div>
        </div>

        <QuickActionsSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          handlers={handlers}
        />
      </CardContent>
    </Card>
  );
}
