import { 
  FolderOpen, 
  Target, 
  Calendar,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MoveisOverviewProps {
  onNavigate?: (tab: string) => void;
}

interface MoveisStats {
  totalArquivos: number;
  produtosFoco: number;
  folgas: number;
}

export function MoveisOverview({ onNavigate }: MoveisOverviewProps) {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<MoveisStats>({
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
          supabase.from('moveis_arquivos').select('*', { count: 'exact', head: true }),
          supabase.from('moveis_produto_foco').select('*', { count: 'exact', head: true }),
          supabase.from('moveis_folgas').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalArquivos: arquivosCount || 0,
          produtosFoco: produtosFocoCount || 0,
          folgas: folgasCount || 0
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas dos móveis:', error);
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
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Produtos em Foco",
      value: isLoading ? "..." : stats.produtosFoco.toString(),
      change: "",
      trend: "stable",
      icon: Target,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Folgas Registradas",
      value: isLoading ? "..." : stats.folgas.toString(),
      change: "",
      trend: "stable",
      icon: Calendar,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Sistema iniciado",
      description: "Dashboard dos móveis carregado com sucesso",
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
