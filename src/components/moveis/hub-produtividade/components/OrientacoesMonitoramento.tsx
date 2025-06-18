import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  FileText,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useOrientacoesMonitoring } from '../hooks/useOrientacoesMonitoring';
import { OrientacaoMonitoramento, RoleCompletionStats } from '../types';

interface RoleStatsCardProps {
  stats: RoleCompletionStats;
}

function RoleStatsCard({ stats }: RoleStatsCardProps) {
  const getRoleLabel = (role: string) => {
    const labels = {
      'consultor_moveis': 'Consultores Móveis',
      'consultor_moda': 'Consultores Moda',
      'jovem_aprendiz': 'Jovens Aprendizes'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'consultor_moveis': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'consultor_moda': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      'jovem_aprendiz': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
  };

  return (
    <div className="p-3 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <Badge className={getRoleColor(stats.role)}>
          {getRoleLabel(stats.role)}
        </Badge>
        {stats.is_complete ? (
          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
        ) : (
          <AlertCircle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Progresso</span>
          <span className="font-medium">
            {stats.viewed_users}/{stats.total_users} ({stats.completion_percentage}%)
          </span>
        </div>
        <Progress value={stats.completion_percentage} className="h-2" />
      </div>

      {stats.pending_users.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Pendentes:</span>
          <div className="mt-1 space-y-1">
            {stats.pending_users.slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-orange-400 dark:bg-orange-500 rounded-full" />
                <span>{user.name}</span>
              </div>
            ))}
            {stats.pending_users.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{stats.pending_users.length - 3} outros...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface OrientacaoCardProps {
  orientacao: OrientacaoMonitoramento;
  onRegisterView: (orientacaoId: string) => Promise<boolean>;
}

function OrientacaoCard({ orientacao, onRegisterView }: OrientacaoCardProps) {
  const isComplete = orientacao.viewing_stats.every(stat => stat.is_complete);
  const totalProgress = orientacao.viewing_stats.length > 0 
    ? Math.round(
        orientacao.viewing_stats.reduce((sum, stat) => sum + stat.completion_percentage, 0) / 
        orientacao.viewing_stats.length
      )
    : 0;

  const getTipoLabel = (tipo: string) => {
    const labels = {
      'vm': 'VM - Visual Merchandising',
      'informativo': 'Informativo',
      'outro': 'Outro'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      'vm': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      'informativo': 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary',
      'outro': 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
  };

  return (
    <Card className={`transition-all duration-200 ${isComplete ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50' : 'border-orange-200 dark:border-orange-800'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">{orientacao.titulo}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getTipoColor(orientacao.tipo)}>
                {getTipoLabel(orientacao.tipo)}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(orientacao.data_criacao).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {isComplete ? (
              <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                <CheckCircle className="h-3 w-3" />
                Completo
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-orange-300 text-orange-700 dark:border-orange-800 dark:text-orange-400">
                <AlertCircle className="h-3 w-3" />
                Pendente
              </Badge>
            )}
            <div className="text-sm font-medium text-muted-foreground">
              {totalProgress}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progresso Geral</span>
            <span className="font-medium">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Status por Cargo
          </h4>
          
          <div className="grid gap-2">
            {orientacao.viewing_stats.map((stats) => (
              <RoleStatsCard key={stats.role} stats={stats} />
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRegisterView(orientacao.orientacao_id)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Registrar Visualização
          </Button>
          
          <div className="text-xs text-muted-foreground">
            ID: {orientacao.orientacao_id.slice(0, 8)}...
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrientacoesMonitoramento() {
  const {
    monitoramentoStats,
    isLoading,
    error,
    registerView,
    fetchMonitoringStats
  } = useOrientacoesMonitoring();

  const handleRegisterView = async (orientacaoId: string) => {
    const success = await registerView(orientacaoId);
    if (success) {
      // Recarregar dados após registrar visualização
      await fetchMonitoringStats();
    }
    return success;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto" />
            <p className="text-red-600 dark:text-red-400">Erro ao carregar monitoramento</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchMonitoringStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Monitoramento de Orientações
              </CardTitle>
              <CardDescription>
                Acompanhe se todos os usuários visualizaram as orientações e informativos
              </CardDescription>
            </div>
            
            <Button 
              onClick={fetchMonitoringStats} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-primary font-medium">Total Orientações</p>
                  <p className="text-xl font-bold text-primary">
                    {monitoramentoStats.total_orientacoes}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Completas</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {monitoramentoStats.orientacoes_completas}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Pendentes</p>
                  <p className="text-xl font-bold text-orange-700 dark:text-orange-400">
                    {monitoramentoStats.orientacoes_pendentes}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-emerald-600 font-medium">% Completo</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {monitoramentoStats.percentage_complete}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progresso Geral</span>
              <span className="font-medium">{monitoramentoStats.percentage_complete}%</span>
            </div>
            <Progress value={monitoramentoStats.percentage_complete} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de orientações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Orientações por Status</h3>
        
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-2 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : monitoramentoStats.orientacoes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Nenhuma orientação encontrada</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {monitoramentoStats.orientacoes.map((orientacao) => (
              <OrientacaoCard
                key={orientacao.orientacao_id}
                orientacao={orientacao}
                onRegisterView={handleRegisterView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 