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
import { RotinaWithStatus } from '../types';
import { Download, FileText, BarChart3 } from 'lucide-react';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface PDFExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rotinas: RotinaWithStatus[];
  onExport: (options: PDFExportOptions) => void;
  isExporting: boolean;
}

export interface PDFExportOptions {
  template: 'compacto' | 'detalhado' | 'executivo';
  includeStats: boolean;
  includeDescription: boolean;
  includeSchedule: boolean;
  includeStatus: boolean;
  groupByCategory: boolean;
  showOnlyFiltered: boolean;
  includeLogo: boolean;
  includeDate: boolean;
}

export function PDFExportDialog({
  open,
  onOpenChange,
  rotinas,
  onExport,
  isExporting
}: PDFExportDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [options, setOptions] = useState<PDFExportOptions>({
    template: 'detalhado',
    includeStats: true,
    includeDescription: true,
    includeSchedule: true,
    includeStatus: true,
    groupByCategory: true,
    showOnlyFiltered: true,
    includeLogo: false,
    includeDate: true,
  });

  const handleExport = () => {
    onExport(options);
  };

  const updateOption = (key: keyof PDFExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const totalRotinas = rotinas.length;
  const concluidas = rotinas.filter(r => r.status === 'concluida').length;
  const pendentes = rotinas.filter(r => r.status === 'pendente').length;
  const atrasadas = rotinas.filter(r => r.status === 'atrasada').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Exportar Relatório PDF
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure as opções de exportação para gerar seu relatório personalizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo dos dados */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Dados a serem exportados:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{totalRotinas}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-green-600">{concluidas}</div>
                <div className="text-muted-foreground">Concluídas</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-blue-600">{pendentes}</div>
                <div className="text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-red-600">{atrasadas}</div>
                <div className="text-muted-foreground">Atrasadas</div>
              </div>
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
                    Inclui todas as informações disponíveis
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
                    Foco em estatísticas e indicadores
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
                  Incluir estatísticas gerais
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDescription"
                  checked={options.includeDescription}
                  onCheckedChange={(checked) => updateOption('includeDescription', checked)}
                />
                <Label htmlFor="includeDescription" className="cursor-pointer">
                  Incluir descrições das rotinas
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSchedule"
                  checked={options.includeSchedule}
                  onCheckedChange={(checked) => updateOption('includeSchedule', checked)}
                />
                <Label htmlFor="includeSchedule" className="cursor-pointer">
                  Incluir periodicidade e horários
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeStatus"
                  checked={options.includeStatus}
                  onCheckedChange={(checked) => updateOption('includeStatus', checked)}
                />
                <Label htmlFor="includeStatus" className="cursor-pointer">
                  Incluir status das rotinas
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Layout Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Organização</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="groupByCategory"
                  checked={options.groupByCategory}
                  onCheckedChange={(checked) => updateOption('groupByCategory', checked)}
                />
                <Label htmlFor="groupByCategory" className="cursor-pointer">
                  Agrupar por categoria
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDate"
                  checked={options.includeDate}
                  onCheckedChange={(checked) => updateOption('includeDate', checked)}
                />
                <Label htmlFor="includeDate" className="cursor-pointer">
                  Incluir data de geração
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div {...getMobileFooterProps()}>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isExporting}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            {isExporting ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 