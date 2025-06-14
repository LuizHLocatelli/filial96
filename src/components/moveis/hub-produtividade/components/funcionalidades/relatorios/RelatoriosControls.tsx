
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';

interface RelatoriosControlsProps {
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  selectedMetric: string;
  onMetricChange: (value: string) => void;
  onExport: () => void;
}

export const RelatoriosControls = ({
  selectedPeriod,
  onPeriodChange,
  selectedMetric,
  onMetricChange,
  onExport,
}: RelatoriosControlsProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
            <SelectItem value="quarter">Este trimestre</SelectItem>
            <SelectItem value="year">Este ano</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={onMetricChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Métrica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completion">Taxa de Conclusão</SelectItem>
            <SelectItem value="volume">Volume de Atividades</SelectItem>
            <SelectItem value="efficiency">Eficiência</SelectItem>
            <SelectItem value="trends">Tendências</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onExport} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </div>
  );
};
