import { HubProdutividade as HubProdutividadeComponent } from "@/components/moveis/hub-produtividade/HubProdutividade";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Activity } from "lucide-react";

export default function HubProdutividade() {
  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Hub de Produtividade"
        description="Central de rotinas, orientações e tarefas"
        icon={Activity}
        iconColor="text-primary"
        status={{
          label: "Ativo",
          color: "bg-green-50 text-green-700 border-green-200"
        }}
        variant="default"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Hub de Produtividade" }
        ]}
      />

      <div className="mt-6">
        <HubProdutividadeComponent />
      </div>
    </PageLayout>
  );
} 