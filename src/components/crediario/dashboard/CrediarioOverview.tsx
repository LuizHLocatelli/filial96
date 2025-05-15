
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Users, Banknote, FileText, PiggyBank, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Button } from "@/components/ui/button";

interface CrediarioOverviewProps {
  onNavigate: (tab: string) => void;
}

export function CrediarioOverview({ onNavigate }: CrediarioOverviewProps) {
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesHoje: 0,
    depositosComprovados: 0,
    depositosPendentes: 0,
    listagens: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch clientes count
        const { count: clientesCount } = await supabase
          .from('crediario_clientes')
          .select('*', { count: 'exact', head: true });
        
        // Fetch today's clients
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        const { count: clientesHojeCount } = await supabase
          .from('crediario_clientes')
          .select('*', { count: 'exact', head: true })
          .eq('dia_contato', formattedDate);
        
        // Fetch depositos stats
        const { data: depositos } = await supabase
          .from('crediario_depositos')
          .select('comprovante');
          
        const depositosComprovados = depositos?.filter(d => d.comprovante).length || 0;
        const depositosPendentes = depositos?.filter(d => !d.comprovante).length || 0;
        
        // Fetch listagens count
        const { count: listagensCount } = await supabase
          .from('crediario_listagens')
          .select('*', { count: 'exact', head: true });
          
        setStats({
          totalClientes: clientesCount || 0,
          clientesHoje: clientesHojeCount || 0,
          depositosComprovados,
          depositosPendentes,
          listagens: listagensCount || 0,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    }
    
    fetchStats();
  }, []);
  
  const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold capitalize">{hoje}</h2>
          <p className="text-muted-foreground">Bem-vindo ao painel do crediário</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onNavigate("diretorio")}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Acessar Arquivos
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => onNavigate("kanban")}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Abrir Quadro
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card onClick={() => onNavigate("clientes")} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalClientes}</div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center text-green-500 font-medium">
                <ArrowUp className="h-3 w-3 mr-1" />
                {stats.clientesHoje} hoje
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card onClick={() => onNavigate("depositos")} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Depósitos Comprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.depositosComprovados}</div>
              <Banknote className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progresso</span>
                <span>{Math.round((stats.depositosComprovados / (stats.depositosComprovados + stats.depositosPendentes || 1)) * 100)}%</span>
              </div>
              <Progress value={(stats.depositosComprovados / (stats.depositosComprovados + stats.depositosPendentes || 1)) * 100} className="h-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card onClick={() => onNavigate("folgas")} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximas Folgas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">3</div>
              <CalendarDays className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Próxima folga em 2 dias
            </div>
          </CardContent>
        </Card>
        
        <Card onClick={() => onNavigate("listagens")} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Listagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.listagens}</div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span>Última atualização: 2 dias atrás</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Progresso dos depósitos</CardTitle>
          <CardDescription>Acompanhamento dos depósitos do mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-muted-foreground">Total de depósitos</div>
              <div className="text-3xl font-bold mt-1">{stats.depositosComprovados + stats.depositosPendentes}</div>
              <div className="text-xs text-muted-foreground mt-1">Mês atual</div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-muted-foreground">Comprovados</div>
                <div className="text-sm font-medium text-green-600">{Math.round((stats.depositosComprovados / (stats.depositosComprovados + stats.depositosPendentes || 1)) * 100)}%</div>
              </div>
              <div className="text-2xl font-bold mt-1">{stats.depositosComprovados}</div>
              <div className="mt-1 h-2 relative w-full overflow-hidden rounded-full bg-green-100">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.round((stats.depositosComprovados / (stats.depositosComprovados + stats.depositosPendentes || 1)) * 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-muted-foreground">Pendentes</div>
                <div className="text-sm font-medium text-yellow-600">{Math.round((stats.depositosPendentes / (stats.depositosComprovados + stats.depositosPendentes || 1)) * 100)}%</div>
              </div>
              <div className="text-2xl font-bold mt-1">{stats.depositosPendentes}</div>
              <div className="mt-1 h-2 relative w-full overflow-hidden rounded-full bg-yellow-100">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${Math.round((stats.depositosPendentes / (stats.depositosComprovados + stats.depositosPendentes || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
