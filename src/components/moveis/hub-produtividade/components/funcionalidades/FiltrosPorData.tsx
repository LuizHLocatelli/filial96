import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight
} from 'lucide-react';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  isWithinInterval,
  differenceInDays,
  isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

interface FiltrosPorDataProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rotinas: Array<any>;
  orientacoes: Array<any>;
  tarefas: Array<any>;
  onFiltersApply: (filters: DateFilters) => void;
}

interface DateFilters {
  dateRange: DateRange | undefined;
  periodType: 'custom' | 'preset';
  preset: string | null;
  groupBy: 'day' | 'week' | 'month';
  includeWeekends: boolean;
  timezone: string;
}

interface DateStats {
  totalItems: number;
  rotinasCount: number;
  orientacoesCount: number;
  tarefasCount: number;
  itemsPerDay: number;
  weekdaysOnly: number;
  completionRate: number;
}

const PRESETS = [
  { id: 'today', label: 'Hoje', days: 0 },
  { id: 'yesterday', label: 'Ontem', days: 1 },
  { id: 'last-7', label: 'Últimos 7 dias', days: 7 },
  { id: 'last-14', label: 'Últimas 2 semanas', days: 14 },
  { id: 'last-30', label: 'Últimos 30 dias', days: 30 },
  { id: 'this-week', label: 'Esta semana', period: 'week' },
  { id: 'last-week', label: 'Semana passada', period: 'week', offset: 1 },
  { id: 'this-month', label: 'Este mês', period: 'month' },
  { id: 'last-month', label: 'Mês passado', period: 'month', offset: 1 },
  { id: 'this-year', label: 'Este ano', period: 'year' },
  { id: 'last-year', label: 'Ano passado', period: 'year', offset: 1 }
];

export function FiltrosPorData({ 
  open, 
  onOpenChange, 
  rotinas, 
  orientacoes, 
  tarefas,
  onFiltersApply 
}: FiltrosPorDataProps) {
  const [filters, setFilters] = useState<DateFilters>({
    dateRange: undefined,
    periodType: 'preset',
    preset: 'last-7',
    groupBy: 'day',
    includeWeekends: true,
    timezone: 'America/Sao_Paulo'
  });

  const [selectedPreset, setSelectedPreset] = useState('last-7');

  // Calcular range de data baseado no preset
  const getDateRangeFromPreset = (presetId: string): DateRange | undefined => {
    const today = new Date();
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return undefined;

    let start: Date, end: Date;

    if (preset.days !== undefined) {
      if (preset.days === 0) {
        start = end = startOfDay(today);
      } else if (preset.days === 1) {
        const yesterday = subDays(today, 1);
        start = end = startOfDay(yesterday);
      } else {
        start = startOfDay(subDays(today, preset.days - 1));
        end = endOfDay(today);
      }
    } else if (preset.period) {
      switch (preset.period) {
        case 'week':
          if (preset.offset) {
            const targetWeek = subWeeks(today, preset.offset);
            start = startOfWeek(targetWeek, { locale: ptBR });
            end = endOfWeek(targetWeek, { locale: ptBR });
          } else {
            start = startOfWeek(today, { locale: ptBR });
            end = endOfWeek(today, { locale: ptBR });
          }
          break;
        case 'month':
          if (preset.offset) {
            const targetMonth = subMonths(today, preset.offset);
            start = startOfMonth(targetMonth);
            end = endOfMonth(targetMonth);
          } else {
            start = startOfMonth(today);
            end = endOfMonth(today);
          }
          break;
        case 'year':
          if (preset.offset) {
            const targetYear = new Date(today.getFullYear() - preset.offset, 0, 1);
            start = startOfYear(targetYear);
            end = endOfYear(targetYear);
          } else {
            start = startOfYear(today);
            end = endOfYear(today);
          }
          break;
        default:
          return undefined;
      }
    } else {
      return undefined;
    }

    return { from: start, to: end };
  };

  // Aplicar preset selecionado
  const applyPreset = (presetId: string) => {
    const range = getDateRangeFromPreset(presetId);
    setSelectedPreset(presetId);
    setFilters(prev => ({
      ...prev,
      dateRange: range,
      periodType: 'preset',
      preset: presetId
    }));
  };

  // Range atual (baseado no tipo selecionado)
  const currentRange = useMemo(() => {
    if (filters.periodType === 'preset' && filters.preset) {
      return getDateRangeFromPreset(filters.preset);
    }
    return filters.dateRange;
  }, [filters.dateRange, filters.periodType, filters.preset]);

  // Calcular estatísticas para o período selecionado
  const stats = useMemo((): DateStats => {
    if (!currentRange?.from || !currentRange?.to) {
      return {
        totalItems: 0,
        rotinasCount: 0,
        orientacoesCount: 0,
        tarefasCount: 0,
        itemsPerDay: 0,
        weekdaysOnly: 0,
        completionRate: 0
      };
    }

    const start = startOfDay(currentRange.from);
    const end = endOfDay(currentRange.to);

    // Filtrar itens no período
    const filteredRotinas = rotinas.filter(item => {
      const itemDate = new Date(item.created_at || item.updated_at);
      return isWithinInterval(itemDate, { start, end });
    });

    const filteredOrientacoes = orientacoes.filter(item => {
      const itemDate = new Date(item.created_at || item.updated_at);
      return isWithinInterval(itemDate, { start, end });
    });

    const filteredTarefas = tarefas.filter(item => {
      const itemDate = new Date(item.created_at || item.updated_at);
      return isWithinInterval(itemDate, { start, end });
    });

    const totalItems = filteredRotinas.length + filteredOrientacoes.length + filteredTarefas.length;
    const totalDays = differenceInDays(end, start) + 1;
    
    // Calcular dias úteis (excluir fins de semana se necessário)
    let workingDays = totalDays;
    if (!filters.includeWeekends) {
      workingDays = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) workingDays++;
      }
    }

    // Taxa de conclusão
    const completedItems = [
      ...filteredRotinas.filter(r => r.status === 'concluida'),
      ...filteredTarefas.filter(t => t.status === 'concluida')
    ].length;
    
    const completableItems = filteredRotinas.length + filteredTarefas.length;
    const completionRate = completableItems > 0 ? (completedItems / completableItems) * 100 : 0;

    return {
      totalItems,
      rotinasCount: filteredRotinas.length,
      orientacoesCount: filteredOrientacoes.length,
      tarefasCount: filteredTarefas.length,
      itemsPerDay: totalDays > 0 ? totalItems / totalDays : 0,
      weekdaysOnly: workingDays,
      completionRate
    };
  }, [currentRange, rotinas, orientacoes, tarefas, filters.includeWeekends]);

  // Aplicar filtros
  const handleApplyFilters = () => {
    onFiltersApply({
      ...filters,
      dateRange: currentRange
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Filtros por Data
          </DialogTitle>
          <DialogDescription>
            Configure filtros temporais avançados para analisar suas atividades
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações de Filtro */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs 
              value={filters.periodType} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, periodType: value as 'custom' | 'preset' }))}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preset">Períodos Predefinidos</TabsTrigger>
                <TabsTrigger value="custom">Período Personalizado</TabsTrigger>
              </TabsList>

              <TabsContent value="preset" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Selecionar Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PRESETS.map(preset => (
                        <Button
                          key={preset.id}
                          variant={selectedPreset === preset.id ? "default" : "outline"}
                          onClick={() => applyPreset(preset.id)}
                          className="justify-start"
                          size="sm"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Selecionar Datas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="range"
                      selected={filters.dateRange}
                      onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                      numberOfMonths={2}
                      locale={ptBR}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Opções Avançadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Opções de Visualização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Agrupar por</Label>
                  <Select 
                    value={filters.groupBy} 
                    onValueChange={(value: 'day' | 'week' | 'month') => 
                      setFilters(prev => ({ ...prev, groupBy: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Dia</SelectItem>
                      <SelectItem value="week">Semana</SelectItem>
                      <SelectItem value="month">Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-weekends"
                    checked={filters.includeWeekends}
                    onChange={(e) => setFilters(prev => ({ ...prev, includeWeekends: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="include-weekends">Incluir fins de semana</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Período Selecionado</CardTitle>
              </CardHeader>
              <CardContent>
                {currentRange?.from && currentRange?.to ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {isSameDay(currentRange.from, currentRange.to) 
                          ? format(currentRange.from, "dd/MM/yyyy", { locale: ptBR })
                          : `${format(currentRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(currentRange.to, "dd/MM/yyyy", { locale: ptBR })}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {differenceInDays(currentRange.to, currentRange.from) + 1} dias
                        {!filters.includeWeekends && ` (${stats.weekdaysOnly} úteis)`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Selecione um período</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
                    <div className="text-xs text-muted-foreground">Total de Itens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completionRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Taxa de Conclusão</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rotinas</span>
                    <Badge variant="secondary">{stats.rotinasCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Orientações</span>
                    <Badge variant="secondary">{stats.orientacoesCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tarefas</span>
                    <Badge variant="secondary">{stats.tarefasCount}</Badge>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span>Média por dia</span>
                    <span className="font-medium">{stats.itemsPerDay.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview de Tendências */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Insights Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.totalItems > 0 ? (
                  <>
                    {stats.completionRate > 75 && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        Excelente produtividade
                      </div>
                    )}
                    {stats.completionRate < 30 && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <TrendingDown className="h-4 w-4" />
                        Muitas tarefas pendentes
                      </div>
                    )}
                    {stats.itemsPerDay > 5 && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                        Período de alta atividade
                      </div>
                    )}
                    {stats.itemsPerDay < 1 && stats.totalItems > 0 && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <Minus className="h-4 w-4" />
                        Período de baixa atividade
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem dados para o período</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button 
                onClick={handleApplyFilters} 
                className="w-full"
                disabled={!currentRange?.from || !currentRange?.to}
              >
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 