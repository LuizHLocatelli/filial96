
import { Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FolgasStatisticsProps {
  isLoadingFolgas: boolean;
  isLoadingCrediaristas: boolean;
  totalFolgasNoMes: number;
  proximasFolgas: number;
  crediariastasComFolga: number;
  totalCrediaristas: number;
}

export function FolgasStatistics({
  isLoadingFolgas,
  isLoadingCrediaristas,
  totalFolgasNoMes,
  proximasFolgas,
  crediariastasComFolga,
  totalCrediaristas,
}: FolgasStatisticsProps) {
  const taxaFolgas = totalCrediaristas > 0 
    ? Math.round((crediariastasComFolga / totalCrediaristas) * 100)
    : 0;

  return (
    <div className="grid-responsive-stats">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Folgas no Mês</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingFolgas ? "..." : totalFolgasNoMes}
          </div>
          <p className="text-xs text-muted-foreground">
            Total registrado
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximas 7 Dias</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingFolgas ? "..." : proximasFolgas}
          </div>
          <p className="text-xs text-muted-foreground">
            Folgas agendadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crediaristas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingCrediaristas ? "..." : `${crediariastasComFolga}/${totalCrediaristas}`}
          </div>
          <p className="text-xs text-muted-foreground">
            Com folgas no mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Folgas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingCrediaristas || isLoadingFolgas ? "..." : `${taxaFolgas}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            Do total de crediaristas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
