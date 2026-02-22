import {
  FileImage,
  FileText,
  Radio,
  Bot
} from "lucide-react";
import { lazy } from "react";
import type { HubHandlers } from "@/components/moveis/hub-produtividade/types/hubTypes";

const Cartazes = lazy(() => import("@/components/moveis/cartazes/Cartazes"));
const Curriculos = lazy(() => import("@/components/curriculos/Curriculos"));
const RadioSection = lazy(() => import("@/components/moveis/hub-produtividade/components/RadioSection"));
const AssistentesHub = lazy(() => import("@/components/assistentes/components/AssistentesHub").then(module => ({ default: module.AssistentesHub })));

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
      label: "Assistentes IA",
      icon: Bot,
      description: "Crie e gerencie seus assistentes de IA personalizados",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden bg-background">
          <AssistentesHub />
        </div>
      )
    },
    {
      value: "radio",
      label: "Rádio",
      icon: Radio,
      description: "Ouça sua rádio favorita",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <RadioSection />
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
