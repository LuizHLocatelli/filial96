
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  MousePointer,
  Download,
  RefreshCw,
  Activity,
  Zap,
  Target,
  Filter,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  Settings
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, subHours, startOfHour } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useModaTracking } from "@/hooks/useModaTracking";
import { MonitoramentoIndividual } from "./MonitoramentoIndividual";
import { PDFExportDialog } from "./components/PDFExportDialog";
import { usePDFExport, PDFExportOptions } from "./hooks/usePDFExport";

interface MonitoringStats {
  totalUsuarios: number;
  usuariosAtivosHoje: number;
  totalSessoes: number;
  tempoMedioSessao: number;
  secaoMaisAcessada: string;
  secaoMenosAcessada: string;
  acessosUltimos7Dias: number;
  crescimentoSemanal: number;
  paginasVisualizadasHoje: number;
  tempoTotalHoje: number;
}

interface AccessEvent {
  id: string;
  user_id: string;
  secao: string;
  acao?: string;
  timestamp: string;
  session_id?: string;
  duracao_segundos?: number;
  detalhes?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
}

interface SectionUsage {
  secao: string;
  acessos: number;
  tempoTotal: number;
  usuariosUnicos: number;
  percentual: number;
  acoesPorSecao: { [acao: string]: number };
}

interface HourlyData {
  hora: number;
  acessos: number;
  usuarios: number;
}

export function Monitoramento() {
  const { trackEvent } = useModaTracking();
  const { exportToPDF } = usePDFExport();
  
  const [stats, setStats] = useState<MonitoringStats>({
    totalUsuarios: 0,
    usuariosAtivosHoje: 0,
    totalSessoes: 0,
    tempoMedioSessao: 0,
    secaoMaisAcessada: "",
    secaoMenosAcessada: "",
    acessosUltimos7Dias: 0,
    crescimentoSemanal: 0,
    paginasVisualizadasHoje: 0,
    tempoTotalHoje: 0
  });
  const [recentEvents, setRecentEvents] = useState<AccessEvent[]>([]);
  const [sectionUsage, setSectionUsage] = useState<SectionUsage[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [isPDFExportDialogOpen, setIsPDFExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [allMonitoringData, setAllMonitoringData] = useState<AccessEvent[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMonitoringData();
    // Registrar acesso à página de monitoramento
    trackPageAccess('monitoramento');
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const trackPageAccess = async (secao: string) => {
    if (!user) return;
    
    try {
      await trackEvent({
        secao: 'monitoramento',
        acao: 'visualizar_dashboard',
        detalhes: { secao_visualizada: secao }
      });
    } catch (error) {
      console.error('Erro ao registrar acesso:', error);
    }
  };

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);
      
      const daysBack = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30;
      const startDate = subDays(new Date(), daysBack);
      
      // Buscar dados de monitoramento
      const { data: monitoringData, error: monitoringError } = await supabase
        .from('moda_monitoramento')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (monitoringError) throw monitoringError;

      // Buscar eventos detalhados
      const { data: detailedEvents, error: detailedError } = await supabase
        .from('moda_eventos_detalhados')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (detailedError) throw detailedError;

      // Converter dados para AccessEvent format
      const monitoringEvents: AccessEvent[] = (monitoringData || []).map(event => ({
        id: event.id,
        user_id: event.user_id || '',
        secao: event.secao,
        acao: event.acao,
        timestamp: event.timestamp,
        session_id: event.session_id,
        duracao_segundos: event.duracao_segundos,
        detalhes: event.detalhes,
        metadata: event.metadata,
        ip_address: event.ip_address ? String(event.ip_address) : undefined,
        user_agent: event.user_agent
      }));

      const detailedAccessEvents: AccessEvent[] = (detailedEvents || []).map(event => ({
        id: event.id,
        user_id: event.user_id || '',
        secao: event.secao,
        acao: event.evento_tipo,
        timestamp: event.created_at || new Date().toISOString(),
        session_id: undefined,
        ip_address: undefined
      }));

      // Combinar eventos
      const combinedEvents = [...monitoringEvents, ...detailedAccessEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Calcular estatísticas
      calculateStats(combinedEvents);
      calculateHourlyData(combinedEvents);
      
      setRecentEvents(combinedEvents.slice(0, 20));
      setAllMonitoringData(combinedEvents);
      
      // Calcular uso por seção
      calculateSectionUsage(combinedEvents);
      
    } catch (error) {
      console.error('Erro ao buscar dados de monitoramento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de monitoramento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: AccessEvent[]) => {
    const hoje = new Date();
    const seteDiasAtras = subDays(hoje, 7);
    const quatorzeDiasAtras = subDays(hoje, 14);
    const hojeFim = endOfDay(hoje);
    const hojeInicio = startOfDay(hoje);
    
    // Usuários únicos
    const usuariosUnicos = new Set(data.map(event => event.user_id)).size;
    
    // Usuários ativos hoje
    const usuariosHoje = new Set(
      data
        .filter(event => {
          const eventDate = new Date(event.timestamp);
          return eventDate >= hojeInicio && eventDate <= hojeFim;
        })
        .map(event => event.user_id)
    ).size;
    
    // Eventos de hoje
    const eventosHoje = data.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= hojeInicio && eventDate <= hojeFim;
    });
    
    // Acessos últimos 7 dias
    const acessosUltimos7Dias = data.filter(
      event => new Date(event.timestamp) >= seteDiasAtras
    ).length;
    
    // Acessos 7-14 dias atrás para calcular crescimento
    const acessosAnteriores = data.filter(
      event => new Date(event.timestamp) >= quatorzeDiasAtras && 
               new Date(event.timestamp) < seteDiasAtras
    ).length;
    
    // Calcular crescimento semanal
    const crescimentoSemanal = acessosAnteriores > 0 
      ? ((acessosUltimos7Dias - acessosAnteriores) / acessosAnteriores) * 100
      : 0;
    
    // Tempo médio de sessão
    const eventosComDuracao = data.filter(event => event.duracao_segundos);
    const tempoMedioSessao = eventosComDuracao.length > 0 
      ? eventosComDuracao.reduce((acc, event) => acc + (event.duracao_segundos || 0), 0) / eventosComDuracao.length
      : 180; // fallback para 3 minutos
    
    // Tempo total hoje
    const tempoTotalHoje = eventosHoje.reduce((acc, event) => acc + (event.duracao_segundos || 180), 0);
    
    // Seções mais e menos acessadas
    const secaoCounts = data.reduce((acc, event) => {
      acc[event.secao] = (acc[event.secao] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const secoes = Object.entries(secaoCounts).sort((a, b) => b[1] - a[1]);
    const secaoMaisAcessada = secoes.length > 0 ? secoes[0][0] : "";
    const secaoMenosAcessada = secoes.length > 0 ? secoes[secoes.length - 1][0] : "";
    
    setStats({
      totalUsuarios: usuariosUnicos,
      usuariosAtivosHoje: usuariosHoje,
      totalSessoes: new Set(data.map(event => event.session_id).filter(Boolean)).size,
      tempoMedioSessao,
      secaoMaisAcessada,
      secaoMenosAcessada,
      acessosUltimos7Dias,
      crescimentoSemanal,
      paginasVisualizadasHoje: eventosHoje.length,
      tempoTotalHoje
    });
  };

  const calculateHourlyData = (data: AccessEvent[]) => {
    const hoje = new Date();
    const hojeInicio = startOfDay(hoje);
    
    const hourlyStats: { [hour: number]: { acessos: number; usuarios: Set<string> } } = {};
    
    // Inicializar todas as horas
    for (let i = 0; i < 24; i++) {
      hourlyStats[i] = { acessos: 0, usuarios: new Set() };
    }
    
    // Calcular dados por hora para hoje
    data
      .filter(event => new Date(event.timestamp) >= hojeInicio)
      .forEach(event => {
        const hora = new Date(event.timestamp).getHours();
        hourlyStats[hora].acessos++;
        hourlyStats[hora].usuarios.add(event.user_id);
      });
    
    const hourlyArray = Object.entries(hourlyStats).map(([hora, dados]) => ({
      hora: parseInt(hora),
      acessos: dados.acessos,
      usuarios: dados.usuarios.size
    }));
    
    setHourlyData(hourlyArray);
  };

  const calculateSectionUsage = (data: AccessEvent[]) => {
    const secaoData = data.reduce((acc, event) => {
      if (!acc[event.secao]) {
        acc[event.secao] = {
          acessos: 0,
          tempoTotal: 0,
          usuariosUnicos: new Set(),
          acoes: {}
        };
      }
      acc[event.secao].acessos++;
      acc[event.secao].tempoTotal += event.duracao_segundos || 180;
      acc[event.secao].usuariosUnicos.add(event.user_id);
      
      // Contar ações por seção
      if (event.acao) {
        acc[event.secao].acoes[event.acao] = (acc[event.secao].acoes[event.acao] || 0) + 1;
      }
      
      return acc;
    }, {} as { [key: string]: any });
    
    const totalAcessos = data.length;
    
    const usage: SectionUsage[] = Object.entries(secaoData).map(([secao, dados]) => ({
      secao,
      acessos: dados.acessos,
      tempoTotal: dados.tempoTotal,
      usuariosUnicos: dados.usuariosUnicos.size,
      percentual: totalAcessos > 0 ? (dados.acessos / totalAcessos) * 100 : 0,
      acoesPorSecao: dados.acoes
    })).sort((a, b) => b.acessos - a.acessos);
    
    setSectionUsage(usage);
  };

  const getSectionName = (secao: string) => {
    const names: { [key: string]: string } = {
      'overview': 'Visão Geral',
      'diretorio': 'Diretório',
      'produto-foco': 'Produto Foco',
      'folgas': 'Folgas',
      'monitoramento': 'Monitoramento'
    };
    return names[secao] || secao;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const exportData = async () => {
    try {
      trackEvent({
        secao: 'monitoramento',
        acao: 'abrir_exportacao_pdf',
        detalhes: { periodo: selectedTimeRange }
      });

      // Abrir o diálogo de exportação PDF
      setIsPDFExportDialogOpen(true);
    } catch (error) {
      console.error('Erro ao abrir exportação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir a exportação",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = async (options: PDFExportOptions) => {
    try {
      setIsExporting(true);
      
      trackEvent({
        secao: 'monitoramento',
        acao: 'exportar_pdf',
        detalhes: { 
          formato: 'pdf', 
          periodo: selectedTimeRange,
          template: options.template,
          includeStats: options.includeStats,
          groupBySection: options.groupBySection
        }
      });

      // Converter AccessEvent[] para o formato esperado pelo PDF export
      const monitoringDataForExport = allMonitoringData.map(event => ({
        ...event,
        session_id: event.session_id || '', // Garantir que session_id nunca seja undefined
        ip_address: event.ip_address || '' // Garantir que ip_address nunca seja undefined
      }));

      const success = await exportToPDF(monitoringDataForExport, stats, options);
      
      if (success) {
        setIsPDFExportDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateReport = async () => {
    try {
      trackEvent({
        secao: 'monitoramento',
        acao: 'gerar_relatorio',
        detalhes: { periodo: selectedTimeRange }
      });

      // Chamar função do banco para gerar relatório
      const { data, error } = await supabase.rpc('get_moda_monitoring_report', {
        days_back: selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30
      });

      if (error) throw error;

      toast({
        title: "Relatório Gerado",
        description: `Relatório do período de ${selectedTimeRange} foi processado`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento de Uso</h1>
          <p className="text-muted-foreground">
            Analytics e métricas de utilização da seção Moda
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Seletor de período */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
              >
                {range === '24h' ? '24h' : range === '7d' ? '7 dias' : '30 dias'}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline"
            onClick={fetchMonitoringData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button 
            variant="outline"
            onClick={generateReport}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={exportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="tempo-real">Tempo Real</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                    <p className="text-2xl font-bold">{stats.totalUsuarios}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ativos Hoje</p>
                    <p className="text-2xl font-bold">{stats.usuariosAtivosHoje}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Eye className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Páginas Hoje</p>
                    <p className="text-2xl font-bold">{stats.paginasVisualizadasHoje}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    <p className="text-2xl font-bold">{formatDuration(Math.round(stats.tempoMedioSessao))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Crescimento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Acessos ({selectedTimeRange})</p>
                    <p className="text-2xl font-bold">{stats.acessosUltimos7Dias}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    stats.crescimentoSemanal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.crescimentoSemanal >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(stats.crescimentoSemanal).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <Target className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">+ Acessada</p>
                    <p className="text-lg font-semibold">{getSectionName(stats.secaoMaisAcessada)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">- Acessada</p>
                    <p className="text-lg font-semibold">{getSectionName(stats.secaoMenosAcessada)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Uso por Seção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Uso por Seção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectionUsage.map((section) => (
                  <div key={section.secao} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{getSectionName(section.secao)}</span>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{section.acessos} acessos</span>
                        <span>{section.usuariosUnicos} usuários</span>
                        <span>{section.percentual.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={section.percentual} className="h-2" />
                    {Object.keys(section.acoesPorSecao).length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(section.acoesPorSecao).map(([acao, count]) => (
                          <Badge key={acao} variant="outline" className="text-xs">
                            {acao}: {count}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <MonitoramentoIndividual />
        </TabsContent>

        <TabsContent value="tempo-real" className="space-y-6">
          {/* Atividade por Hora */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Atividade por Hora (Hoje)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2">
                {hourlyData.map((hour) => (
                  <div key={hour.hora} className="text-center">
                    <div 
                      className="bg-purple-200 dark:bg-purple-800 rounded mx-auto mb-1"
                      style={{ 
                        height: `${Math.max(4, (hour.acessos / Math.max(...hourlyData.map(h => h.acessos))) * 60)}px`,
                        width: '20px'
                      }}
                    />
                    <div className="text-xs text-muted-foreground">{hour.hora}h</div>
                    <div className="text-xs font-medium">{hour.acessos}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma atividade registrada</h3>
                  <p className="text-muted-foreground">
                    Os acessos à seção aparecerão aqui em tempo real
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                          <Eye className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{getSectionName(event.secao)}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{format(new Date(event.timestamp), "HH:mm", { locale: ptBR })}</span>
                            {event.acao && (
                              <Badge variant="outline" className="text-xs">
                                {event.acao}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {event.duracao_segundos ? formatDuration(event.duracao_segundos) : 'Em andamento'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analises" className="space-y-6">
          {/* Análises Avançadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance das Seções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectionUsage.slice(0, 5).map((section, index) => (
                    <div key={section.secao} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{getSectionName(section.secao)}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(section.tempoTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{section.acessos} acessos</span>
                          <span>{section.usuariosUnicos} usuários</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Monitoramento Ativo</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Coleta de Dados</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Ativa</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Última Atualização</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(), "HH:mm:ss")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total de Eventos</span>
                    <span className="text-sm font-medium">
                      {recentEvents.length > 0 ? `${recentEvents.length}+` : '0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Monitoramento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Coleta Automática</h4>
                    <p className="text-sm text-muted-foreground">
                      Coleta automaticamente dados de navegação e interação
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Ativa
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Atualização em Tempo Real</h4>
                    <p className="text-sm text-muted-foreground">
                      Atualiza dados a cada 30 segundos
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Ativa
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Retenção de Dados</h4>
                    <p className="text-sm text-muted-foreground">
                      Dados mantidos por 90 dias
                    </p>
                  </div>
                  <Badge variant="outline">
                    90 dias
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Exportação PDF */}
      <PDFExportDialog
        open={isPDFExportDialogOpen}
        onOpenChange={setIsPDFExportDialogOpen}
        data={allMonitoringData.map(event => ({
          ...event,
          session_id: event.session_id || '',
          ip_address: event.ip_address || ''
        }))}
        stats={stats}
        onExport={handleExportPDF}
        isExporting={isExporting}
        selectedTimeRange={selectedTimeRange}
      />
    </div>
  );
}
