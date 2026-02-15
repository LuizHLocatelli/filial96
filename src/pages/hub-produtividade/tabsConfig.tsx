import {
  FileImage,
  Bot,
  FileText
} from "lucide-react";
import { lazy } from "react";
import type { HubHandlers } from "@/components/moveis/hub-produtividade/types/hubTypes";

const Cartazes = lazy(() => import("@/components/moveis/cartazes/Cartazes"));
const AssistentesAI = lazy(() => import("@/components/assistentes-ai/AssistentesAI"));
const Curriculos = lazy(() => import("@/components/curriculos/Curriculos"));

interface TabsConfigProps {
  isLoading: boolean;
  handlers: HubHandlers;
  isManager?: boolean;
}

export function createTabsConfig({
  isLoading,
  handlers,
  isManager = false
}: TabsConfigProps) {
  const tabs = [
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

  // Add Curriculos tab only for managers
  if (isManager) {
    tabs.push({
      value: "curriculos",
      label: "Currículos",
      icon: FileText,
      description: "Gerenciamento de currículos recebidos",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <Curriculos />
        </div>
      )
    });
  }

  return tabs;
}
