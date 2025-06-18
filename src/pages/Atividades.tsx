import { useSearchParams } from "react-router-dom";
import { Activity, Download, RefreshCw } from "lucide-react";

import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { NotificationsDebug } from "@/components/notifications/NotificationsDebug";

// Componentes modularizados
import { useActivities } from "./Atividades/hooks/useActivities";
import { ActivityStats } from "./Atividades/components/ActivityStats";
import { ActivityFilters } from "./Atividades/components/ActivityFilters";
import { ActivityTimeline } from "./Atividades/components/ActivityTimeline";

export default function Atividades() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "timeline";
  
  const {
    activities,
    filteredActivities,
    isLoading,
    filters,
    stats,
    fetchActivities,
    handleActivityClick,
    exportActivities,
    updateFilter
  } = useActivities();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Todas as Atividades"
        description="Visualize e gerencie todas as atividades do sistema"
        icon={Activity}
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Atividades" }
        ]}
        actions={
          <div className="flex gap-2">
            <Button onClick={exportActivities} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={fetchActivities} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        }
      />

      {/* Estatísticas rápidas */}
      <ActivityStats stats={stats} />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo de Atividades</CardTitle>
              <CardDescription>
                Visualize todas as atividades recentes em um único lugar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtros */}
              <ActivityFilters
                filters={filters}
                activities={activities}
                onFilterChange={updateFilter}
              />

              {/* Timeline */}
              <div className="border rounded-lg overflow-hidden">
                <ActivityTimeline
                  activities={filteredActivities}
                  isLoading={isLoading}
                  onActivityClick={handleActivityClick}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico do Sistema</CardTitle>
              <CardDescription>
                Ferramenta para diagnosticar problemas com notificações e atividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsDebug />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
} 