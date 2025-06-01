import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Users, Banknote, FileText, PiggyBank, Calendar, ArrowUp, ArrowDown, ListTodo, FolderArchive, Coffee } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface CrediarioOverviewProps {
  onNavigate: (tab: string) => void;
}

export function CrediarioOverview({ onNavigate }: CrediarioOverviewProps) {
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesHoje: 0,
    depositosVencendo: 0,
    depositosHoje: 0,
    listagens: 0,
    folgasHoje: 0
  });

  const hoje = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  // Array de ações rápidas para navegação
  const quickAccessItems = [
    {
      title: "Listagens",
      description: "Relatórios e listagens",
      icon: ListTodo,
      onClick: () => onNavigate("listagens")
    },
    {
      title: "Clientes",
      description: "Gestão de clientes",
      icon: Users,
      onClick: () => onNavigate("clientes")
    },
    {
      title: "Depósitos",
      description: "Controle de depósitos",
      icon: PiggyBank,
      onClick: () => onNavigate("depositos")
    },
    {
      title: "Folgas",
      description: "Gestão de folgas",
      icon: Coffee,
      onClick: () => onNavigate("folgas")
    },
    {
      title: "Diretório",
      description: "Arquivos do crediário",
      icon: FolderArchive,
      onClick: () => onNavigate("diretorio")
    }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Usando dados mockados para demonstração
        setStats(prev => ({
          ...prev,
          totalClientes: 127, // Mock data
          clientesHoje: 5, // Mock data
          depositosVencendo: 15, // Mock data
          depositosHoje: 8, // Mock data
          listagens: 23, // Mock data
          folgasHoje: 3 // Mock data
        }));
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold capitalize">{hoje}</h2>
          <p className="text-muted-foreground">Bem-vindo ao painel do crediário</p>
        </div>
      </div>

      {/* Acesso Rápido - Versão Horizontal Compacta */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Acesso Rápido</h3>
        <div className="w-full p-2 bg-background border rounded-lg">
          <ScrollArea className="w-full">
            <div className={`flex items-center gap-2 px-2 ${
              quickAccessItems.length > 4 ? 'grid grid-cols-2 sm:flex sm:flex-wrap' : 'flex flex-wrap'
            }`}>
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TooltipProvider key={item.title} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 sm:h-8 px-2 sm:px-3 flex items-center gap-2 text-xs font-medium justify-center sm:justify-start"
                          onClick={item.onClick}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs leading-tight">{item.title}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </ScrollArea>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Depósitos Vencendo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.depositosVencendo}</div>
              <PiggyBank className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center text-orange-500 font-medium">
                <ArrowDown className="h-3 w-3 mr-1" />
                {stats.depositosHoje} hoje
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card onClick={() => onNavigate("folgas")} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Folgas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.folgasHoje}</div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span>Hoje: {stats.folgasHoje} colaboradores</span>
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Meta do mês</span>
              <span className="font-medium">75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Coletados</p>
              <p className="text-2xl font-bold text-green-600">R$ 145.230</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">R$ 48.560</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
