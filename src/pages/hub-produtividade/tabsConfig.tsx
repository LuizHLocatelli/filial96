
import { 
  Activity,
  Target,
  FileImage
} from "lucide-react";
import { HubDashboard } from "@/components/moveis/hub-produtividade/components/dashboard/HubDashboard";
import { MetasDashboard } from "@/components/moveis/hub-produtividade/components/metas/MetasDashboard";
import { lazy } from "react";

const Cartazes = lazy(() => import("@/components/moveis/cartazes/Cartazes"));

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
      value: "cartazes",
      label: "Cartazes",
      icon: FileImage,
      description: "Gestão de cartazes da loja",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <Cartazes />
        </div>
      )
    }
  ];
}
