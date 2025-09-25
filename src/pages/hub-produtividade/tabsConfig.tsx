
import { 
  Target,
  FileImage,
  Bot
} from "lucide-react";
import { MetasDashboard } from "@/components/moveis/hub-produtividade/components/metas/MetasDashboard";
import { lazy } from "react";

const Cartazes = lazy(() => import("@/components/moveis/cartazes/Cartazes"));
const AssistentesAI = lazy(() => import("@/components/assistentes-ai/AssistentesAI"));

interface TabsConfigProps {
  stats: any;
  isLoading: boolean;
  handlers: any;
  orientacoes: any[];
  onViewRotina: (rotinaId: string) => void;
  onViewTarefa: (tarefaId: string) => void;
}

export function createTabsConfig({
  stats,
  isLoading,
  handlers,
  orientacoes,
  onViewRotina,
  onViewTarefa
}: TabsConfigProps) {
  return [
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
    },
    {
      value: "assistentes",
      label: "Assistentes",
      icon: Bot,
      description: "Chatbots assistentes de IA",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <AssistentesAI />
        </div>
      )
    }
  ];
}
