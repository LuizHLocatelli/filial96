import { lazy } from "react";
import type { HubHandlers } from "@/components/hub-produtividade/types/hubTypes";

const Cartazes = lazy(() => import("@/components/moveis/cartazes/Cartazes"));
const RadioSection = lazy(() => import("@/components/hub-produtividade/components/RadioSection"));
const AssistentesHub = lazy(() => import("@/components/assistentes/components/AssistentesHub").then(module => ({ default: module.AssistentesHub })));
const Escalas = lazy(() => import("@/components/hub-produtividade/escalas/Escalas"));

interface TabsConfigProps {
  isLoading: boolean;
  handlers: HubHandlers;
}

export function createTabsConfig({
  isLoading,
  handlers
}: TabsConfigProps) {
  const tabs = [
    {
      value: "escalas",
      label: "Escalas",
      icon: "📅",
      description: "Gestão de horários e cargas",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden bg-background p-4 md:p-6">
          <Escalas />
        </div>
      )
    },
    {
      value: "cartazes",
      label: "Cartazes",
      icon: "🎨",
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
      icon: "🤖",
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
      icon: "📻",
      description: "Ouça sua rádio favorita",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <RadioSection />
        </div>
      )
    }
  ];

  return tabs;
}
