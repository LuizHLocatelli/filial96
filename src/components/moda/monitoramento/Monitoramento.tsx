import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Target
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface MonitoringStats {
  totalUsuarios: number;
  usuariosAtivosHoje: number;
  totalSessoes: number;
  tempoMedioSessao: number;
  secaoMaisAcessada: string;
  secaoMenosAcessada: string;
  acessosUltimos7Dias: number;
  crescimentoSemanal: number;
}

interface AccessEvent {
  id: string;
  user_id: string;
  secao: string;
  timestamp: string;
  session_id: string;
  duracao_segundos?: number;
  ip_address?: string;
  user_agent?: string;
}

interface SectionUsage {
  secao: string;
  acessos: number;
  tempoTotal: number;
  usuariosUnicos: number;
  percentual: number;
}

export function Monitoramento() {
  const [stats, setStats] = useState<MonitoringStats>({
    totalUsuarios: 0,
    usuariosAtivosHoje: 0,
    totalSessoes: 0,
    tempoMedioSessao: 0,
    secaoMaisAcessada: "",
    secaoMenosAcessada: "",
    acessosUltimos7Dias: 0,
    crescimentoSemanal: 0
  });
  const [recentEvents, setRecentEvents] = useState<AccessEvent[]>([]);
  const [sectionUsage, setSectionUsage] = useState<SectionUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMonitoringData();
    // Registrar acesso à página de monitoramento
    trackPageAccess('monitoramento');
  }, []);

  const trackPageAccess = async (secao: string) => {
    if (!user) return;
    
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await supabase
        .from('moda_monitoramento')
        .insert([{
          user_id: user.id,
          secao: secao,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Erro ao registrar acesso:', error);
    }
  };

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar dados de monitoramento
      const { data: monitoringData, error: monitoringError } = await supabase
        .from('moda_monitoramento')
        .select('*')
        .order('timestamp', { ascending: false });

      if (monitoringError) throw monitoringError;

      // Calcular estatísticas
      calculateStats(monitoringData || []);
      
      // Buscar eventos recentes
      setRecentEvents((monitoringData || []).slice(0, 10));
      
      // Calcular uso por seção
      calculateSectionUsage(monitoringData || []);
      
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
    
    // Usuários únicos
    const usuariosUnicos = new Set(data.map(event => event.user_id)).size;
    
    // Usuários ativos hoje
    const usuariosHoje = new Set(
      data
        .filter(event => startOfDay(new Date(event.timestamp)) >= startOfDay(hoje))
        .map(event => event.user_id)
    ).size;
    
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
    
    // Tempo médio de sessão (simulado)
    const tempoMedioSessao = data.length > 0 
      ? data.reduce((acc, event) => acc + (event.duracao_segundos || 180), 0) / data.length
      : 0;
    
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
      totalSessoes: new Set(data.map(event => event.session_id)).size,
      tempoMedioSessao,
      secaoMaisAcessada,
      secaoMenosAcessada,
      acessosUltimos7Dias,
      crescimentoSemanal
    });
  };

  const calculateSectionUsage = (data: AccessEvent[]) => {
    const secaoData = data.reduce((acc, event) => {
      if (!acc[event.secao]) {
        acc[event.secao] = {
          acessos: 0,
          tempoTotal: 0,
          usuariosUnicos: new Set()
        };
      }
      acc[event.secao].acessos++;
      acc[event.secao].tempoTotal += event.duracao_segundos || 180;
      acc[event.secao].usuariosUnicos.add(event.user_id);
      return acc;
    }, {} as { [key: string]: any });
    
    const totalAcessos = data.length;
    
    const usage: SectionUsage[] = Object.entries(secaoData).map(([secao, dados]) => ({
      secao,
      acessos: dados.acessos,
      tempoTotal: dados.tempoTotal,
      usuariosUnicos: dados.usuariosUnicos.size,
      percentual: totalAcessos > 0 ? (dados.acessos / totalAcessos) * 100 : 0
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const exportData = async () => {
    try {
      const { data, error } = await supabase
        .from('moda_monitoramento')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Criar CSV
      const csvContent = [
        ['Data/Hora', 'Usuário', 'Seção', 'Duração (s)', 'Session ID'].join(','),
        ...(data || []).map(event => [
          format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm:ss'),
          event.user_id,
          getSectionName(event.secao),
          event.duracao_segundos || 0,
          event.session_id
        ].join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moda_monitoramento_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar dados",
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
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={fetchMonitoringData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={exportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

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
                <p className="text-sm text-muted-foreground">Total Sessões</p>
                <p className="text-2xl font-bold">{stats.totalSessoes}</p>
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
                <p className="text-sm text-muted-foreground">Acessos (7 dias)</p>
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
                <p className="text-sm text-muted-foreground">Seção + Acessada</p>
                <p className="text-lg font-semibold">{getSectionName(stats.secaoMaisAcessada)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                <Zap className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seção - Acessada</p>
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
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${section.percentual}%` }}
                  />
                </div>
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
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{getSectionName(event.secao)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
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
    </div>
  );
} 