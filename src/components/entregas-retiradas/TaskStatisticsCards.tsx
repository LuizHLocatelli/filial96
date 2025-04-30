
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck } from "lucide-react";

interface TaskStatsProps {
  taskCounts: {
    entregas: {
      pendente: number;
      em_andamento: number;
      concluida: number;
      total: number;
    },
    retiradas: {
      pendente: number;
      em_andamento: number;
      concluida: number;
      total: number;
    }
  }
}

export function TaskStatisticsCards({ taskCounts }: TaskStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Entregas</CardTitle>
            <CardDescription>
              Total de {taskCounts.entregas.total} entregas agendadas
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-full bg-brand-blue-100 p-2 flex items-center justify-center">
            <Truck className="h-7 w-7 text-brand-blue-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-4">
            <div>
              <p className="text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold">{taskCounts.entregas.pendente}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Em andamento</p>
              <p className="text-xl font-bold">{taskCounts.entregas.em_andamento}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Concluídas</p>
              <p className="text-xl font-bold">{taskCounts.entregas.concluida}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Retiradas</CardTitle>
            <CardDescription>
              Total de {taskCounts.retiradas.total} retiradas agendadas
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-100 p-2 flex items-center justify-center">
            <Package className="h-7 w-7 text-purple-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-4">
            <div>
              <p className="text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold">{taskCounts.retiradas.pendente}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Em andamento</p>
              <p className="text-xl font-bold">{taskCounts.retiradas.em_andamento}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Concluídas</p>
              <p className="text-xl font-bold">{taskCounts.retiradas.concluida}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
