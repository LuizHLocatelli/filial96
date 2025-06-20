import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, BarChart3, Users, Activity } from 'lucide-react';
import { PDFExportOptions, MonitoringData } from '../hooks/usePDFExport';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface PDFExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MonitoringData[];
  stats: any;
  onExport: (options: PDFExportOptions) => void;
  isExporting: boolean;
  selectedTimeRange: string;
}

export function PDFExportDialog({
  open,
  onOpenChange,
  data,
  stats,
  onExport,
  isExporting,
  selectedTimeRange
}: PDFExportDialogProps) {
  const [options, setOptions] = useState<PDFExportOptions>({
    template: 'detalhado',
    includeStats: true,
    includeDetails: true,
    includeMetadata: false,
    includeCharts: false,
    groupBySection: true,
    groupByUser: false,
    includeDate: true,
    periodo: selectedTimeRange,
  });

  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  const handleExport = () => {
    onExport({
      ...options,
      periodo: selectedTimeRange
    });
  };

  const updateOption = (key: keyof PDFExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const totalEvents = data.length;
  const uniqueUsers = new Set(data.map(d => d.user_id)).size;
  const uniqueSections = new Set(data.map(d => d.secao)).size;
  const totalDuration = data.reduce((acc, d) => acc + (d.duracao_segundos || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div>Exportar Relatório PDF</div>
              <div className="text-sm font-normal text-muted-foreground">
                Monitoramento Moda
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure as opções de exportação para gerar seu relatório personalizado de monitoramento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo dos dados */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dados a serem exportados:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg text-blue-600">{totalEvents}</div>
                <div className="text-muted-foreground">Total de eventos</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-green-600">{uniqueUsers}</div>
                <div className="text-muted-foreground">Usuários únicos</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-purple-600">{uniqueSections}</div>
                <div className="text-muted-foreground">Seções visitadas</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-orange-600">{Math.floor(totalDuration / 60)}min</div>
                <div className="text-muted-foreground">Tempo total</div>
              </div>
            </div>
            <div className="mt-3 text-center p-2 bg-primary/10 rounded text-sm text-primary">
              Período: {selectedTimeRange === '24h' ? '24 horas' : selectedTimeRange === '7d' ? '7 dias' : '30 dias'}
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Modelo do Relatório</Label>
            <RadioGroup
              value={options.template}
              onValueChange={(value) => updateOption('template', value as PDFExportOptions['template'])}
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="compacto" id="compacto" />
                <div className="flex-1">
                  <Label htmlFor="compacto" className="cursor-pointer font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Compacto
                    </div>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Formato resumido, ideal para impressão
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="detalhado" id="detalhado" />
                <div className="flex-1">
                  <Label htmlFor="detalhado" className="cursor-pointer font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Detalhado
                    </div>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Inclui todas as informações de monitoramento
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="executivo" id="executivo" />
                <div className="flex-1">
                  <Label htmlFor="executivo" className="cursor-pointer font-medium">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Executivo
                    </div>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Foco em estatísticas e indicadores de performance
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Content Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Conteúdo do Relatório</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeStats"
                  checked={options.includeStats}
                  onCheckedChange={(checked) => updateOption('includeStats', checked)}
                />
                <Label htmlFor="includeStats" className="cursor-pointer">
                  Incluir estatísticas gerais e indicadores
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDetails"
                  checked={options.includeDetails}
                  onCheckedChange={(checked) => updateOption('includeDetails', checked)}
                />
                <Label htmlFor="includeDetails" className="cursor-pointer">
                  Incluir duração das sessões e ações
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={options.includeMetadata}
                  onCheckedChange={(checked) => updateOption('includeMetadata', checked)}
                />
                <Label htmlFor="includeMetadata" className="cursor-pointer">
                  Incluir metadados (session ID, IP, user agent)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDate"
                  checked={options.includeDate}
                  onCheckedChange={(checked) => updateOption('includeDate', checked)}
                />
                <Label htmlFor="includeDate" className="cursor-pointer">
                  Incluir data e hora de geração
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Organization Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Organização dos Dados</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="groupBySection"
                  checked={options.groupBySection}
                  onCheckedChange={(checked) => {
                    updateOption('groupBySection', checked);
                    if (checked) updateOption('groupByUser', false);
                  }}
                />
                <Label htmlFor="groupBySection" className="cursor-pointer">
                  Agrupar dados por seção
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="groupByUser"
                  checked={options.groupByUser}
                  onCheckedChange={(checked) => {
                    updateOption('groupByUser', checked);
                    if (checked) updateOption('groupBySection', false);
                  }}
                />
                <Label htmlFor="groupByUser" className="cursor-pointer">
                  Agrupar dados por usuário (Top 10 mais ativos)
                </Label>
              </div>
            </div>
          </div>

          {/* Preview da configuração */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">
              Pré-visualização da configuração:
            </h4>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Modelo: {options.template === 'compacto' ? 'Compacto' : options.template === 'detalhado' ? 'Detalhado' : 'Executivo'}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Estatísticas: {options.includeStats ? 'Incluídas' : 'Não incluídas'}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Organização: {options.groupBySection ? 'Por seção' : options.groupByUser ? 'Por usuário' : 'Lista simples'}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Detalhes técnicos: {options.includeMetadata ? 'Incluídos' : 'Não incluídos'}
              </div>
            </div>
          </div>
        </div>

        <div {...getMobileFooterProps()}>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Gerando PDF...' : 'Gerar PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 