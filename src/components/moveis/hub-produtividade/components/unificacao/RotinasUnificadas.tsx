
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Activity, CheckSquare, Calendar, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function RotinasUnificadas() {
  const [activeTab, setActiveTab] = useState("rotinas");
  const isMobile = useIsMobile();

  // Mock data - substituir pelos dados reais
  const stats = {
    rotinas: { total: 1, concluidas: 0, pendentes: 1, atrasadas: 0 },
    tarefas: { total: 1, concluidas: 0, pendentes: 1, atrasadas: 0 }
  };

  const rotinas = [
    {
      id: "1",
      titulo: "Organização do VM",
      descricao: "Organização Mensal",
      status: "pendente",
      frequencia: "mensal",
      prioridade: "alta",
      responsavel: "Luiz Henrique Locatelli",
      dataLimite: "2025-06-11"
    }
  ];

  const tarefas = [
    {
      id: "1",
      titulo: "teste rotina",
      descricao: "Tarefa gerada automaticamente da rotina",
      status: "pendente",
      origem: "rotina",
      responsavel: "Sistema",
      dataLimite: "2025-06-11"
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <Card className={cn(
      "glass-card transition-all duration-200 hover:scale-105",
      bgColor,
      isMobile && "min-h-[80px]"
    )}>
      <CardContent className={cn("p-4", isMobile && "p-3")}>
        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              "text-muted-foreground font-medium",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {title}
            </p>
            <p className={cn(
              "font-bold",
              color,
              isMobile ? "text-xl" : "text-2xl"
            )}>
              {value}
            </p>
          </div>
          <Icon className={cn(
            color,
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
        </div>
      </CardContent>
    </Card>
  );

  const ActivityCard = ({ item, type }: { item: any; type: 'rotina' | 'tarefa' }) => (
    <Card className="glass-card glass-hover">
      <CardHeader className={cn("pb-3", isMobile && "p-4 pb-2")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className={cn(
              "text-foreground line-clamp-2",
              isMobile ? "text-sm" : "text-base"
            )}>
              {item.titulo}
            </CardTitle>
            <p className={cn(
              "text-muted-foreground mt-1 line-clamp-2",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {item.descricao}
            </p>
          </div>
          <Badge 
            variant="outline"
            className={cn(
              "ml-2 flex-shrink-0",
              item.status === 'pendente' && "bg-yellow-50 text-yellow-700 border-yellow-200",
              item.status === 'concluida' && "bg-green-50 text-green-700 border-green-200",
              item.status === 'atrasada' && "bg-red-50 text-red-700 border-red-200",
              isMobile ? "text-xs px-2 py-1" : "text-sm"
            )}
          >
            {item.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0", isMobile && "p-4 pt-0")}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className={cn("truncate", isMobile ? "text-xs" : "text-sm")}>
              {item.dataLimite}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4 flex-shrink-0" />
            <span className={cn("truncate", isMobile ? "text-xs" : "text-sm")}>
              {item.responsavel}
            </span>
          </div>

          {type === 'rotina' && item.frequencia && (
            <Badge variant="secondary" className={cn(
              "bg-blue-50 text-blue-700 border-blue-200",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {item.frequencia}
            </Badge>
          )}

          {type === 'tarefa' && item.origem && (
            <Badge variant="secondary" className={cn(
              "bg-purple-50 text-purple-700 border-purple-200",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {item.origem}
            </Badge>
          )}
        </div>

        <div className={cn(
          "flex gap-2 mt-4",
          isMobile && "flex-col"
        )}>
          <Button 
            size="sm" 
            variant="outline" 
            className={cn(
              "flex-1 text-xs",
              isMobile && "w-full h-8"
            )}
          >
            Visualizar
          </Button>
          <Button 
            size="sm" 
            className={cn(
              "flex-1 text-xs",
              isMobile && "w-full h-8"
            )}
          >
            Atualizar Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header com botões de ação */}
      <div className={cn(
        "flex items-center justify-between gap-3",
        isMobile && "flex-col items-stretch"
      )}>
        <div>
          <h2 className={cn(
            "font-bold text-foreground",
            isMobile ? "text-lg" : "text-xl"
          )}>
            Central de Atividades
          </h2>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-sm"
          )}>
            Gerencie rotinas, tarefas, VM e informativos em um só lugar.
          </p>
        </div>
        
        <div className={cn(
          "flex gap-2",
          isMobile && "w-full"
        )}>
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "gap-2",
              isMobile && "flex-1 h-9"
            )}
          >
            <Plus className="h-4 w-4" />
            Novo VM ou Informativo
          </Button>
          <Button 
            size="sm"
            className={cn(
              "gap-2",
              isMobile && "flex-1 h-9"
            )}
          >
            <Plus className="h-4 w-4" />
            Nova Rotina
          </Button>
        </div>
      </div>

      {/* Tabs para alternar entre tipos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
          "grid w-full grid-cols-2 mb-4",
          isMobile && "h-10"
        )}>
          <TabsTrigger 
            value="rotinas" 
            className={cn(
              "flex items-center gap-2",
              isMobile ? "text-xs px-2" : "text-sm"
            )}
          >
            <Activity className="h-4 w-4" />
            Rotinas
            <Badge variant="secondary" className="ml-1 text-xs">
              {stats.rotinas.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="tarefas" 
            className={cn(
              "flex items-center gap-2",
              isMobile ? "text-xs px-2" : "text-sm"
            )}
          >
            <CheckSquare className="h-4 w-4" />
            Tarefas VM e Informativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rotinas" className="space-y-4">
          {/* Estatísticas das Rotinas */}
          <div className={cn(
            "grid gap-3",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            <StatCard
              title="Total"
              value={stats.rotinas.total}
              icon={Activity}
              color="text-blue-600"
              bgColor="border-blue-200 bg-blue-50/50"
            />
            <StatCard
              title="Concluídas"
              value={stats.rotinas.concluidas}
              icon={CheckSquare}
              color="text-green-600"
              bgColor="border-green-200 bg-green-50/50"
            />
            <StatCard
              title="Pendentes"
              value={stats.rotinas.pendentes}
              icon={CheckSquare}
              color="text-yellow-600"
              bgColor="border-yellow-200 bg-yellow-50/50"
            />
            <StatCard
              title="Atrasadas"
              value={stats.rotinas.atrasadas}
              icon={CheckSquare}
              color="text-red-600"
              bgColor="border-red-200 bg-red-50/50"
            />
          </div>

          {/* Lista de Rotinas */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
          )}>
            {rotinas.map(rotina => (
              <ActivityCard key={rotina.id} item={rotina} type="rotina" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tarefas" className="space-y-4">
          {/* Estatísticas das Tarefas */}
          <div className={cn(
            "grid gap-3",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            <StatCard
              title="Total"
              value={stats.tarefas.total}
              icon={CheckSquare}
              color="text-blue-600"
              bgColor="border-blue-200 bg-blue-50/50"
            />
            <StatCard
              title="Concluídas"
              value={stats.tarefas.concluidas}
              icon={CheckSquare}
              color="text-green-600"
              bgColor="border-green-200 bg-green-50/50"
            />
            <StatCard
              title="Pendentes"
              value={stats.tarefas.pendentes}
              icon={CheckSquare}
              color="text-yellow-600"
              bgColor="border-yellow-200 bg-yellow-50/50"
            />
            <StatCard
              title="Atrasadas"
              value={stats.tarefas.atrasadas}
              icon={CheckSquare}
              color="text-red-600"
              bgColor="border-red-200 bg-red-50/50"
            />
          </div>

          {/* Lista de Tarefas */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
          )}>
            {tarefas.map(tarefa => (
              <ActivityCard key={tarefa.id} item={tarefa} type="tarefa" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
