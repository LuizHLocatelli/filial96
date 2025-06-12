
import { 
  Activity,
  CheckSquare, 
  FileText, 
  BarChart3,
  Users,
  Target
} from "lucide-react";
import { HubDashboard } from "@/components/moveis/hub-produtividade/components/dashboard/HubDashboard";
import { CentralAtividades } from "@/components/moveis/hub-produtividade/components/unificacao/CentralAtividades";
import OrientacoesMonitoramento from "@/components/moveis/hub-produtividade/components/OrientacoesMonitoramento";
import { MetasDashboard } from "@/components/moveis/hub-produtividade/components/metas/MetasDashboard";

interface TabsConfigProps {
  stats: any;
  isLoading: boolean;
  handlers: any;
  rotinas: any[];
  tarefas: any[];
  onViewRotina: (rotinaId: string) => void;
  onViewTarefa: (tarefaId: string) => void;
  onRelatorios: () => void;
}

export function createTabsConfig({
  stats,
  isLoading,
  handlers,
  rotinas,
  tarefas,
  onViewRotina,
  onViewTarefa,
  onRelatorios
}: TabsConfigProps) {
  return [
    {
      value: "overview",
      label: "Visão Geral",
      icon: Activity,
      description: "Dashboard e métricas",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <HubDashboard
            stats={stats}
            isLoading={isLoading}
            handlers={handlers}
            rotinas={rotinas}
            tarefas={tarefas}
            onViewRotina={onViewRotina}
            onViewTarefa={onViewTarefa}
          />
        </div>
      )
    },
    {
      value: "metas",
      label: "Metas",
      icon: Target,
      description: "Gestão de metas mensais",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden p-6">
          <MetasDashboard />
        </div>
      )
    },
    {
      value: "atividades",
      label: "Atividades",
      icon: CheckSquare,
      description: "Rotinas, Tarefas e Informativos",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <CentralAtividades />
        </div>
      )
    },
    {
      value: "monitoramento",
      label: "Monitoramento",
      icon: Users,
      description: "Acompanhamento por cargo",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <OrientacoesMonitoramento />
        </div>
      )
    },
    {
      value: "relatorios",
      label: "Relatórios",
      icon: BarChart3,
      description: "Relatórios e análises",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden p-6">
          <div className="text-center space-y-4">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Relatórios</h3>
              <p className="text-muted-foreground">Visualize relatórios e análises de produtividade</p>
              <div className="mt-4">
                <button 
                  onClick={onRelatorios}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Abrir Relatórios Completos
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];
}
