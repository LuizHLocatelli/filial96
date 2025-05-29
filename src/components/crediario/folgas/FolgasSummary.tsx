import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crediarista, Folga } from "./types";
import { User } from "lucide-react";

interface FolgasSummaryProps {
  crediaristas: Crediarista[];
  folgas: Folga[];
  currentMonth: Date;
  isLoading: boolean;
}

export function FolgasSummary({ crediaristas, folgas, currentMonth, isLoading }: FolgasSummaryProps) {
  const getFolgasNoMes = (crediaristaId: string) => {
    return folgas.filter(
      (folga) => folga.crediaristaId === crediaristaId &&
      folga.data.getMonth() === currentMonth.getMonth() &&
      folga.data.getFullYear() === currentMonth.getFullYear()
    ).length;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Resumo de Folgas do Mês</CardTitle>
        <CardDescription>
          Total de folgas registradas para cada crediarista no mês atual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : crediaristas.length === 0 ? (
          <div className="text-center py-6">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Nenhum crediarista encontrado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {crediaristas.map((crediarista) => {
              const totalFolgas = getFolgasNoMes(crediarista.id);
              return (
                <Card key={crediarista.id} className="shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between items-center text-center">
                  <CardHeader className="flex flex-col items-center space-y-2 pb-2 pt-4 px-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={crediarista.avatar} alt={crediarista.nome} />
                      <AvatarFallback>{crediarista.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" title={crediarista.nome}>{crediarista.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Crediarista
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 px-4">
                    <div>
                      <p className="text-3xl font-bold">{totalFolgas}</p>
                      <p className="text-xs text-muted-foreground">
                        {totalFolgas === 1 ? "folga no mês" : "folgas no mês"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
