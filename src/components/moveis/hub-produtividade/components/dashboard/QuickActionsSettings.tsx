import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Search, BarChart3, RotateCcw, BookOpen, ListTodo, Filter, FileText, Download } from "lucide-react";

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
      <DialogContent className="interactive-card max-w-2xl">
        <DialogHeader className="border-b-2 border-border pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border-2 border-primary/20">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-semibold">Configurações de Ações Rápidas</span>
              <p className="text-sm text-muted-foreground font-normal">Teste e organize suas ações do hub</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Use esta área para testar as funcionalidades e organizar seu fluxo de trabalho
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Seção: Criar Novo Conteúdo */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Novo Conteúdo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                variant="success" 
                onClick={handlers.onNovaRotina}
                className="h-12 justify-start"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Nova Rotina</div>
                  <div className="text-xs opacity-80">Criar fluxo</div>
                </div>
              </Button>
              <Button 
                variant="action" 
                onClick={handlers.onNovaOrientacao}
                className="h-12 justify-start"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Nova Orientação</div>
                  <div className="text-xs opacity-80">Documentar</div>
                </div>
              </Button>
              <Button 
                variant="primary-outline" 
                onClick={handlers.onNovaTarefa}
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
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Pesquisar e Filtrar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handlers.onBuscaAvancada}
                className="h-12 justify-start selectable-item"
              >
                <Search className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Busca Avançada</div>
                  <div className="text-xs text-muted-foreground">Localizar conteúdo</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                onClick={handlers.onFiltrosPorData}
                className="h-12 justify-start selectable-item"
              >
                <Filter className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Filtros por Data</div>
                  <div className="text-xs text-muted-foreground">Organizar período</div>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button 
                variant="primary" 
                onClick={handlers.onRelatorios}
                className="h-10"
              >
                <FileText className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
              <Button 
                variant="outline" 
                onClick={handlers.onRefreshData}
                className="h-10 selectable-item"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                variant="outline" 
                onClick={handlers.onExportData}
                className="h-10 selectable-item"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="h-10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t-2 border-border">
          <p className="text-xs text-muted-foreground">
            Todas as ações estão funcionando e organizadas por categoria
          </p>
          <Button variant="success" onClick={() => onOpenChange(false)}>
            Pronto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
