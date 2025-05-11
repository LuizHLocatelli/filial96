
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Deposito } from "@/hooks/crediario/useDepositos";
import { useIsMobile } from "@/hooks/use-mobile";

interface DepositStatsProps {
  depositos: Deposito[];
  currentMonth: Date;
  diasDoMes: Date[];
  progresso: number;
}

export function DepositStats({ depositos, currentMonth, diasDoMes, progresso }: DepositStatsProps) {
  const isMobile = useIsMobile();
  
  // Filtering deposits for current month
  const depositosDoMes = depositos.filter((deposito) => 
    deposito.data.getMonth() === currentMonth.getMonth() && 
    deposito.data.getFullYear() === currentMonth.getFullYear()
  );
  
  // Calculate working days (excluding weekends)
  const diasUteis = diasDoMes.filter((day) => ![0, 6].includes(day.getDay())).length;
  
  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle className="text-xl">Acompanhamento</CardTitle>
        <CardDescription>
          Progresso dos depósitos bancários neste mês
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm font-medium">{progresso}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>
        
        <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2"} gap-4`}>
          <div>
            <span className="text-muted-foreground text-sm">Total de Depósitos</span>
            <p className="text-xl font-bold">
              {depositosDoMes.length}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Dias Úteis</span>
            <p className="text-xl font-bold">
              {diasUteis}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
