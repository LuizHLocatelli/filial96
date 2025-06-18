import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório PDF
          </DialogTitle>
          <DialogDescription>
            Configure as opções de exportação para gerar seu relatório personalizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Resumo dos dados */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Dados a serem exportados:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total: {totalRotinas}</div>
              <div>Concluídas: {concluidas}</div>
              <div>Pendentes: {pendentes}</div>
              <div>Atrasadas: {atrasadas}</div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Modelo do Relatório</Label>
            <RadioGroup
              value={options.template}
              onValueChange={(value) => updateOption('template', value as PDFExportOptions['template'])}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
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
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
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

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
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
          <div className="space-y-3">
            <Label className="text-base font-medium">Conteúdo do Relatório</Label>
            <div className="space-y-3">
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
          <div className="space-y-3">
            <Label className="text-base font-medium">Organização</Label>
            <div className="space-y-3">
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 