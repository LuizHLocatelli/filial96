import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { useMobileDialog } from '@/hooks/useMobileDialog';

import { useRelatoriosData } from './relatorios/useRelatoriosData';
import { RelatoriosControls } from './relatorios/RelatoriosControls';
import { TabOverview } from './relatorios/TabOverview';
import { TabProductivity } from './relatorios/TabProductivity';
import { TabCategories } from './relatorios/TabCategories';
import { TabTrends } from './relatorios/TabTrends';

interface RelatoriosProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  rotinas: Array<any>;
  orientacoes: Array<any>;
  tarefas: Array<any>;
  stats: any;
  inline?: boolean;
}

const RelatoriosCore = ({ rotinas, orientacoes, tarefas, stats }: Omit<RelatoriosProps, 'open' | 'onOpenChange' | 'inline'>) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('completion');

  const { productivityMetrics, categoryStats, weeklyData } = useRelatoriosData({
    rotinas,
    orientacoes,
    tarefas,
  });

  const exportReport = () => {
    const reportData = {
      dataGeracao: new Date().toISOString(),
      periodo: selectedPeriod,
      metricas: productivityMetrics,
      categorias: categoryStats,
      dadosSemanais: weeklyData,
      resumoGeral: {
        totalRotinas: rotinas.length,
        totalOrientacoes: orientacoes.length,
        totalTarefas: tarefas.length,
        stats,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-produtividade-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      <RelatoriosControls
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        onExport={exportReport}
      />
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <TabOverview productivityMetrics={productivityMetrics} weeklyData={weeklyData} />
        </TabsContent>
        <TabsContent value="productivity">
          <TabProductivity productivityMetrics={productivityMetrics} stats={stats} />
        </TabsContent>
        <TabsContent value="categories">
          <TabCategories categoryStats={categoryStats} />
        </TabsContent>
        <TabsContent value="trends">
          <TabTrends />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export function Relatorios({ 
  open = false,
  onOpenChange = () => {},
  rotinas, 
  orientacoes, 
  tarefas,
  stats,
  inline = false
}: RelatoriosProps) {
  const { getMobileDialogProps } = useMobileDialog();
  const relatoriosContentProps = { rotinas, orientacoes, tarefas, stats };
  
  if (inline) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Relatórios e Análises</h2>
          </div>
          <p className="text-muted-foreground">
            Análises detalhadas de produtividade e performance
          </p>
        </div>
        <RelatoriosCore {...relatoriosContentProps} />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("extraLarge")} className="flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div>Relatórios e Análises</div>
              <div className="text-sm font-normal text-muted-foreground">
                Hub de Produtividade
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Análises detalhadas de produtividade e performance
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <RelatoriosCore {...relatoriosContentProps} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
