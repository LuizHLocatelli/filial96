import { 
  Activity,
  FileText, 
  BarChart3,
  Users,
  Target
} from "lucide-react";
import { HubDashboard } from "@/components/moveis/hub-produtividade/components/dashboard/HubDashboard";
import OrientacoesMonitoramento from "@/components/moveis/hub-produtividade/components/OrientacoesMonitoramento";
import { MetasDashboard } from "@/components/moveis/hub-produtividade/components/metas/MetasDashboard";
import { Relatorios } from "@/components/moveis/hub-produtividade/components/funcionalidades/Relatorios";

interface TabsConfigProps {
  stats: any;
  isLoading: boolean;
  handlers: any;
  rotinas: any[];
  tarefas: any[];
  orientacoes: any[];
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
  orientacoes,
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
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <Relatorios
            rotinas={rotinas || []}
            orientacoes={orientacoes || []}
            tarefas={tarefas || []}
            stats={stats}
            inline={true}
          />
        </div>
      )
    }
  ];
}
