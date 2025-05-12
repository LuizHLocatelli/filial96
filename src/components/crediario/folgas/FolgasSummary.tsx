
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crediarista, Folga } from "./types";

interface FolgasSummaryProps {
  crediaristas: Crediarista[];
  folgas: Folga[];
  currentMonth: Date;
  isLoading: boolean;
}

export function FolgasSummary({ crediaristas, folgas, currentMonth, isLoading }: FolgasSummaryProps) {
  return (
    <Card className="w-full md:w-auto">
      <CardHeader className="pb-3">
        <CardTitle>Folgas Registradas</CardTitle>
        <CardDescription>
          Resumo das folgas da equipe de crediaristas
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : crediaristas.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-muted-foreground">
              Nenhum crediarista encontrado
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {crediaristas.map((crediarista) => (
              <div key={crediarista.id} className="flex flex-col">
                <span className="text-muted-foreground text-sm">
                  {crediarista.nome}
                </span>
                <span className="text-2xl font-bold">
                  {folgas.filter(
                    (folga) => folga.crediaristaId === crediarista.id &&
                    folga.data.getMonth() === currentMonth.getMonth() &&
                    folga.data.getFullYear() === currentMonth.getFullYear()
                  ).length}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
