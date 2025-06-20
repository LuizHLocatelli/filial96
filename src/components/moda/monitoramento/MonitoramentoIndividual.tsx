import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Search,
  Clock,
  BarChart3,
  Eye,
  Activity,
  TrendingUp,
  Calendar,
  Target,
  Filter,
  Download,
  RefreshCw,
  User,
  MousePointer
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useModaTracking } from "@/hooks/useModaTracking";

interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
}

interface UserStats {
  user_id: string;
  user_name: string;
  total_acessos: number;
  tempo_total_segundos: number;
  secoes_acessadas: string[];
  ultima_atividade: string;
  sessoes_ativas: number;
  secao_mais_usada: string;
  crescimento_semanal: number;
  acoes_realizadas: number;
  tempo_medio_sessao: number;
}

interface UserActivity {
  id: string;
  user_id: string;
  secao: string;
  acao?: string;
  timestamp: string;
  duracao_segundos?: number;
  detalhes?: any;
}

export function MonitoramentoIndividual() {
  const { trackEvent } = useModaTracking();
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState('lista');

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
    };
    
    loadData();
    
    // Registrar acesso ao monitoramento individual
    trackEvent({
      secao: 'monitoramento',
      acao: 'visualizar_individual',
      detalhes: { periodo: selectedTimeRange }
    });
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchUserStats();
    }
  }, [selectedTimeRange, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, avatar_url')
        .order('name');

      if (error) throw error;

      setUsers(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive"
      });
      return [];
    }
  };

  const fetchUserStats = async () => {
    try {
      setIsLoading(true);
      
      // Garantir que temos os usuários carregados
      let currentUsers = users;
      if (currentUsers.length === 0) {
        currentUsers = await fetchUsers();
      }
      
      const daysBack = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30;
      const startDate = subDays(new Date(), daysBack);
      const previousStartDate = subDays(startDate, daysBack);

      // Buscar dados de monitoramento para o período atual
      const { data: currentData, error: currentError } = await supabase
        .from('moda_monitoramento')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (currentError) throw currentError;

      // Buscar dados do período anterior para comparação
      const { data: previousData, error: previousError } = await supabase
        .from('moda_monitoramento')
        .select('*')
        .gte('timestamp', previousStartDate.toISOString())
        .lt('timestamp', startDate.toISOString());

      if (previousError) throw previousError;

      // Processar estatísticas por usuário
      const statsMap = new Map<string, UserStats>();
      
      // Processar dados atuais
      (currentData || []).forEach(event => {
        if (!statsMap.has(event.user_id)) {
          const user = currentUsers.find(u => u.id === event.user_id);
          statsMap.set(event.user_id, {
            user_id: event.user_id,
            user_name: user?.name || `Usuário ${event.user_id.slice(0, 8)}`,
            total_acessos: 0,
            tempo_total_segundos: 0,
            secoes_acessadas: [],
            ultima_atividade: event.timestamp,
            sessoes_ativas: 0,
            secao_mais_usada: '',
            crescimento_semanal: 0,
            acoes_realizadas: 0,
            tempo_medio_sessao: 0
          });
        }

        const stats = statsMap.get(event.user_id)!;
        stats.total_acessos++;
        stats.tempo_total_segundos += event.duracao_segundos || 180;
        
        if (!stats.secoes_acessadas.includes(event.secao)) {
          stats.secoes_acessadas.push(event.secao);
        }

        if (new Date(event.timestamp) > new Date(stats.ultima_atividade)) {
          stats.ultima_atividade = event.timestamp;
        }

        if (event.acao) {
          stats.acoes_realizadas++;
        }
      });

      // Calcular crescimento semanal
      const previousAccessCount = new Map<string, number>();
      (previousData || []).forEach(event => {
        const current = previousAccessCount.get(event.user_id) || 0;
        previousAccessCount.set(event.user_id, current + 1);
      });

      // Finalizar cálculos
      statsMap.forEach((stats, userId) => {
        const previousCount = previousAccessCount.get(userId) || 0;
        stats.crescimento_semanal = previousCount > 0 
          ? ((stats.total_acessos - previousCount) / previousCount) * 100
          : 0;

        // Calcular seção mais usada
        const secaoCounts = new Map<string, number>();
        (currentData || []).filter(e => e.user_id === userId).forEach(event => {
          const current = secaoCounts.get(event.secao) || 0;
          secaoCounts.set(event.secao, current + 1);
        });

        let maxCount = 0;
        secaoCounts.forEach((count, secao) => {
          if (count > maxCount) {
            maxCount = count;
            stats.secao_mais_usada = secao;
          }
        });

        // Calcular sessões ativas (últimas 24h)
        const oneDayAgo = subDays(new Date(), 1);
        const recentSessions = new Set();
        (currentData || []).filter(e => 
          e.user_id === userId && new Date(e.timestamp) >= oneDayAgo
        ).forEach(event => {
          recentSessions.add(event.session_id);
        });
        stats.sessoes_ativas = recentSessions.size;

        // Tempo médio de sessão
        stats.tempo_medio_sessao = stats.sessoes_ativas > 0 
          ? stats.tempo_total_segundos / stats.sessoes_ativas
          : 0;
      });

      setUserStats(Array.from(statsMap.values()).sort((a, b) => b.total_acessos - a.total_acessos));
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas dos usuários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserActivities = async (userId: string) => {
    try {
      const daysBack = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30;
      const startDate = subDays(new Date(), daysBack);

      const { data, error } = await supabase
        .from('moda_monitoramento')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      setUserActivities(data || []);
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as atividades do usuário",
        variant: "destructive"
      });
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    setActiveTab('detalhes');
    fetchUserActivities(userId);
    
    trackEvent({
      secao: 'monitoramento',
      acao: 'selecionar_usuario',
      detalhes: { usuario_id: userId }
    });
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
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'gerente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'crediarista': 'bg-primary/10 text-primary border-primary/20',
      'consultor_moveis': 'bg-green-100 text-green-800 border-green-300',
      'consultor_moda': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'jovem_aprendiz': 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getRoleName = (role: string) => {
    const names: { [key: string]: string } = {
      'gerente': 'Gerente',
      'crediarista': 'Crediarista',
      'consultor_moveis': 'Consultor Móveis',
      'consultor_moda': 'Consultor Moda',
      'jovem_aprendiz': 'Jovem Aprendiz'
    };
    return names[role] || role;
  };

  const exportUserData = async () => {
    try {
      trackEvent({
        secao: 'monitoramento',
        acao: 'exportar_dados_individual',
        detalhes: { periodo: selectedTimeRange }
      });

      const csvContent = [
        ['Usuário', 'Função', 'Total Acessos', 'Tempo Total', 'Última Atividade', 'Seção Mais Usada', 'Crescimento %', 'Ações Realizadas'].join(','),
        ...userStats.map(stats => [
          stats.user_name,
          users.find(u => u.id === stats.user_id)?.role || 'N/A',
          stats.total_acessos,
          formatDuration(stats.tempo_total_segundos),
          format(new Date(stats.ultima_atividade), 'dd/MM/yyyy HH:mm'),
          getSectionName(stats.secao_mais_usada),
          `${stats.crescimento_semanal.toFixed(1)}%`,
          stats.acoes_realizadas
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moda_monitoramento_individual_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Dados individuais exportados com sucesso!",
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

  const filteredStats = userStats.filter(stats =>
    stats.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserData = selectedUser ? userStats.find(stats => stats.user_id === selectedUser) : null;
  const selectedUserProfile = selectedUser ? users.find(u => u.id === selectedUser) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento Individual</h1>
          <p className="text-muted-foreground">
            Acompanhe o uso da seção Moda por usuário individual
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
            onClick={async () => {
              setIsLoading(true);
              await fetchUsers();
              await fetchUserStats();
              setIsLoading(false);
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button 
                          variant="success"
            onClick={exportUserData}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.length}</div>
            <p className="text-xs text-muted-foreground">
              no período de {selectedTimeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.reduce((acc, stats) => acc + stats.total_acessos, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              todos os usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(userStats.reduce((acc, stats) => acc + stats.tempo_total_segundos, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              tempo de uso total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuário Mais Ativo</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {userStats.length > 0 ? userStats[0].user_name : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {userStats.length > 0 ? `${userStats[0].total_acessos} acessos` : 'Sem dados'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de Usuários
          </TabsTrigger>
          <TabsTrigger value="detalhes" className="flex items-center gap-2" disabled={!selectedUser}>
            <User className="h-4 w-4" />
            Detalhes do Usuário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Ativos ({filteredStats.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Acessos</TableHead>
                      <TableHead>Tempo Total</TableHead>
                      <TableHead>Última Atividade</TableHead>
                      <TableHead>Seção Favorita</TableHead>
                      <TableHead>Crescimento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStats.map((stats) => {
                      const userProfile = users.find(u => u.id === stats.user_id);
                      return (
                        <TableRow 
                          key={stats.user_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleUserSelect(stats.user_id)}
                        >
                          <TableCell className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userProfile?.avatar_url} alt={stats.user_name} />
                              <AvatarFallback>{getInitials(stats.user_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{stats.user_name}</div>
                              {userProfile && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getRoleColor(userProfile.role)}`}
                                >
                                  {getRoleName(userProfile.role)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                              {stats.total_acessos}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDuration(stats.tempo_total_segundos)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(stats.ultima_atividade), 'dd/MM HH:mm', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getSectionName(stats.secao_mais_usada)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {stats.crescimento_semanal >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                              )}
                              <span className={stats.crescimento_semanal >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {stats.crescimento_semanal.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detalhes" className="space-y-4">
          {selectedUserData && selectedUserProfile && (
            <>
              {/* Cabeçalho do usuário */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUserProfile.avatar_url} alt={selectedUserData.user_name} />
                      <AvatarFallback className="text-lg">
                        {getInitials(selectedUserData.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">{selectedUserData.user_name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={getRoleColor(selectedUserProfile.role)}
                        >
                          {getRoleName(selectedUserProfile.role)}
                        </Badge>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          ID: {selectedUserProfile.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setActiveTab('lista')}>
                      Voltar à Lista
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas do usuário */}
              <div className="grid-responsive-dashboard">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedUserData.total_acessos}</div>
                    <p className="text-xs text-muted-foreground">
                      em {selectedTimeRange === '24h' ? '24 horas' : selectedTimeRange === '7d' ? '7 dias' : '30 dias'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(selectedUserData.tempo_total_segundos)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tempo médio: {formatDuration(selectedUserData.tempo_medio_sessao)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Seções Acessadas</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedUserData.secoes_acessadas.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Favorita: {getSectionName(selectedUserData.secao_mais_usada)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ações Realizadas</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedUserData.acoes_realizadas}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {selectedUserData.crescimento_semanal >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                      )}
                      <span className={`text-xs ${selectedUserData.crescimento_semanal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUserData.crescimento_semanal.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Atividades recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {userActivities.length > 0 ? (
                    <div className="space-y-3">
                      {userActivities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{getSectionName(activity.secao)}</Badge>
                              {activity.acao && (
                                <span className="text-sm text-muted-foreground">
                                  • {activity.acao}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                              {activity.duracao_segundos && (
                                <>
                                  <span>•</span>
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(activity.duracao_segundos)}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma atividade encontrada no período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 