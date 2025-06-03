import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity
} from 'lucide-react';
import { HubViewMode, ProductivityStats } from '../../types';
import { ActivityItem } from '../../types';
import { HubSection, HubHandlers } from '../../types/hubTypes';
import { HubDashboard } from '../dashboard/HubDashboard';
import { Rotinas } from '../../../rotinas/Rotinas';
import { VmTarefas } from '../../../orientacoes/Orientacoes';
import { Relatorios } from '../funcionalidades/Relatorios';
import OrientacoesMonitoramento from '../OrientacoesMonitoramento';
import { cn } from '@/lib/utils';

interface HubDesktopLayoutProps {
  currentSection: HubViewMode;
  onSectionChange: (section: HubViewMode) => void;
  sections: HubSection[];
  stats: ProductivityStats;
  activities: ActivityItem[];
  isLoading: boolean;
  isTablet: boolean;
  handlers: HubHandlers;
  rotinas?: Array<any>;
  orientacoes?: Array<any>;
  tarefas?: Array<any>;
}

export function HubDesktopLayout({
  currentSection,
  onSectionChange,
  sections,
  stats,
  activities,
  isLoading,
  isTablet,
  handlers,
  rotinas = [],
  orientacoes = [],
  tarefas = []
}: HubDesktopLayoutProps) {
  const [showBuscaAvancada, setShowBuscaAvancada] = useState(false);
  const [showFiltrosPorData, setShowFiltrosPorData] = useState(false);
  const [showRelatorios, setShowRelatorios] = useState(false);

  const handleBuscaAvancada = () => setShowBuscaAvancada(true);
  const handleFiltrosPorData = () => setShowFiltrosPorData(true);
  const handleRelatorios = () => setShowRelatorios(true);

  const handleSearchResults = (results: any) => {
    console.log('Resultados da busca avançada:', results);
  };

  const handleDateFilters = (filters: any) => {
    console.log('Filtros por data aplicados:', filters);
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Navegação por Tabs */}
      <Tabs value={currentSection} onValueChange={(value) => onSectionChange(value as HubViewMode)}>
        <TabsList className={cn(
          "grid w-full h-auto p-1",
          isTablet ? "grid-cols-2 gap-1" : "grid-cols-4 gap-1"
        )}>
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex flex-col items-center gap-1 py-2.5 px-2 relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <section.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{section.title}</span>
              </div>
              {section.badge && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {section.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Conteúdo das Tabs */}
        <div className="mt-4">
          {/* Dashboard */}
          <TabsContent value="dashboard" className="mt-0">
            <HubDashboard
              stats={stats}
              activities={activities}
              isLoading={isLoading}
              handlers={{
                ...handlers,
                onBuscaAvancada: handleBuscaAvancada,
                onFiltrosPorData: handleFiltrosPorData,
                onRelatorios: handleRelatorios
              }}
            />
          </TabsContent>

          {/* Rotinas */}
          <TabsContent value="rotinas" className="mt-0">
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <Rotinas />
            </div>
          </TabsContent>

          {/* Orientações */}
          <TabsContent value="orientacoes" className="mt-0">
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <VmTarefas />
            </div>
          </TabsContent>

          {/* Monitoramento */}
          <TabsContent value="monitoramento" className="mt-0">
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <OrientacoesMonitoramento />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <Relatorios
        open={showRelatorios}
        onOpenChange={setShowRelatorios}
        rotinas={rotinas}
        orientacoes={orientacoes}
        tarefas={tarefas}
        stats={stats}
      />
    </div>
  );
}
