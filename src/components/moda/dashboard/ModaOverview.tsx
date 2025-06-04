import { 
  FolderOpen, 
  Target, 
  Calendar,
  CheckCircle2,
  Shirt,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ModaOverviewProps {
  onNavigate?: (tab: string) => void;
}

interface ModaStats {
  totalArquivos: number;
  produtosFoco: number;
  folgas: number;
}

export function ModaOverview({ onNavigate }: ModaOverviewProps) {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<ModaStats>({
    totalArquivos: 0,
    produtosFoco: 0,
    folgas: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados reais do banco de dados
  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        setIsLoading(true);
        
        // Buscar dados em paralelo
        const [
          { count: arquivosCount },
          { count: produtosFocoCount },
          { count: folgasCount }
        ] = await Promise.all([
          supabase.from('moda_arquivos').select('*', { count: 'exact', head: true }),
          supabase.from('moda_produto_foco').select('*', { count: 'exact', head: true }),
          supabase.from('moda_folgas').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalArquivos: arquivosCount || 0,
          produtosFoco: produtosFocoCount || 0,
          folgas: folgasCount || 0
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas da moda:', error);
        // Manter valores padrão em caso de erro
        setStats({
          totalArquivos: 0,
          produtosFoco: 0,
          folgas: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealStats();
  }, []);

  const statsCards = [
    {
      title: "Arquivos no Diretório",
      value: isLoading ? "..." : stats.totalArquivos.toString(),
      change: "",
      trend: "stable",
      icon: FolderOpen,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Produtos em Foco",
      value: isLoading ? "..." : stats.produtosFoco.toString(),
      change: "",
      trend: "stable",
      icon: Target,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/20"
    },
    {
      title: "Folgas Registradas",
      value: isLoading ? "..." : stats.folgas.toString(),
      change: "",
      trend: "stable",
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Sistema iniciado",
      description: "Dashboard da moda carregado com sucesso",
      time: "Agora",
      type: "sistema",
      user: "Sistema"
    },
    {
      id: 2,
      title: "Dados atualizados",
      description: `${stats.totalArquivos} arquivos disponíveis no diretório`,
      time: "Agora",
      type: "arquivo",
      user: "Sistema"
    },
    {
      id: 3,
      title: "Produtos em foco",
      description: `${stats.produtosFoco} produtos configurados`,
      time: "Agora",
      type: "meta",
      user: "Sistema"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title}
              className={`hover-lift transition-all duration-300 border-0 shadow-soft hover:shadow-medium ${stat.bgColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  {stat.trend === "up" && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20">
                      {stat.change}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    {stat.value}
                  </div>
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Access Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover-lift transition-all duration-300 border-0 shadow-soft hover:shadow-medium bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30"
            onClick={() => onNavigate?.("diretorio")}
          >
            <CardContent className="p-4 text-center">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 w-fit mx-auto mb-3">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Diretório</h3>
              <p className="text-xs text-muted-foreground mt-1">Arquivos e documentos</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover-lift transition-all duration-300 border-0 shadow-soft hover:shadow-medium bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30"
            onClick={() => onNavigate?.("produto-foco")}
          >
            <CardContent className="p-4 text-center">
              <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 w-fit mx-auto mb-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Produto Foco</h3>
              <p className="text-xs text-muted-foreground mt-1">Produtos prioritários</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover-lift transition-all duration-300 border-0 shadow-soft hover:shadow-medium bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30"
            onClick={() => onNavigate?.("folgas")}
          >
            <CardContent className="p-4 text-center">
              <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 w-fit mx-auto mb-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Folgas</h3>
              <p className="text-xs text-muted-foreground mt-1">Calendário de folgas</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover-lift transition-all duration-300 border-0 shadow-soft hover:shadow-medium bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30"
            onClick={() => onNavigate?.("monitoramento")}
          >
            <CardContent className="p-4 text-center">
              <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 w-fit mx-auto mb-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Monitoramento</h3>
              <p className="text-xs text-muted-foreground mt-1">Análises de uso</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Atividade Recente</h2>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="p-4 hover:bg-muted/50 transition-colors duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {activity.type === 'sistema' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      {activity.type === 'arquivo' && <FolderOpen className="h-4 w-4 text-primary" />}
                      {activity.type === 'meta' && <Target className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.time}</span>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 