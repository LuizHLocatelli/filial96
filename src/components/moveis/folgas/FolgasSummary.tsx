
import { useState, useMemo } from "react";
import { addDays, format, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, ChevronDown, ChevronRight, ChevronUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folga } from "./types";
import { Badge } from "@/components/ui/badge";

interface FolgasSummaryProps {
  folgas: Folga[];
  isLoading: boolean;
  currentMonth: Date;
  getConsultorById: (id: string) => any;
}

export function FolgasSummary({
  folgas,
  isLoading,
  currentMonth,
  getConsultorById,
}: FolgasSummaryProps) {
  const [showAll, setShowAll] = useState(false);

  const folgasThisMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return folgas.filter(
      (folga) => {
        const folgaDate = new Date(folga.data);
        return isSameMonth(folgaDate, currentMonth);
      }
    );
  }, [folgas, currentMonth]);
  
  const folgasProximos7Dias = useMemo(() => {
    const hoje = new Date();
    const daquiA7Dias = addDays(hoje, 7);
    
    return folgas.filter(
      (folga) => {
        const folgaDate = new Date(folga.data);
        return folgaDate >= hoje && folgaDate <= daquiA7Dias;
      }
    ).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [folgas]);

  const consultoresComFolga = useMemo(() => {
    const consultoresMap = new Map();
    
    folgasThisMonth.forEach((folga) => {
      const consultor = getConsultorById(folga.consultorId);
      if (consultor) {
        if (!consultoresMap.has(folga.consultorId)) {
          consultoresMap.set(folga.consultorId, {
            ...consultor,
            folgas: 1,
          });
        } else {
          const consultorData = consultoresMap.get(folga.consultorId);
          consultoresMap.set(folga.consultorId, {
            ...consultorData,
            folgas: consultorData.folgas + 1,
          });
        }
      }
    });
    
    return Array.from(consultoresMap.values());
  }, [folgasThisMonth, getConsultorById]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span>Folgas por Consultor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consultoresComFolga.length === 0 ? (
            <div className="text-center text-muted-foreground py-2">
              Nenhuma folga registrada no mês atual
            </div>
          ) : (
            <div className="space-y-2">
              {consultoresComFolga.map((consultor) => (
                <div
                  key={consultor.id}
                  className="flex items-center justify-between border-b py-2 last:border-0"
                >
                  <span className="font-medium">{consultor.nome}</span>
                  <Badge variant="outline">{consultor.folgas} folga(s)</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Próximas Folgas</CardTitle>
          {folgasProximos7Dias.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="h-8"
            >
              {showAll ? (
                <>
                  Mostrar menos <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Ver todas <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {folgasProximos7Dias.length === 0 ? (
            <div className="text-center text-muted-foreground py-2">
              Nenhuma folga nos próximos 7 dias
            </div>
          ) : (
            <div className="space-y-2">
              {(showAll
                ? folgasProximos7Dias
                : folgasProximos7Dias.slice(0, 3)
              ).map((folga) => {
                const consultor = getConsultorById(folga.consultorId);
                return (
                  <div
                    key={folga.id}
                    className="flex items-center justify-between border-b py-2 last:border-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {consultor ? consultor.nome : "Consultor não encontrado"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(folga.data), "EEEE, dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                    {folga.motivo && (
                      <Badge variant="outline">{folga.motivo}</Badge>
                    )}
                  </div>
                );
              })}
              
              {folgasProximos7Dias.length > 3 && !showAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="w-full justify-center mt-2"
                >
                  <ChevronDown className="mr-1 h-4 w-4" />
                  Ver mais {folgasProximos7Dias.length - 3} folgas
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
