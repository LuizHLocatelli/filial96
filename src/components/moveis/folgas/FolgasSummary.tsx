import { useState, useMemo } from "react";
import { addDays, format, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, ChevronDown, ChevronRight, ChevronUp, Users, CalendarDays, UserCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folga } from "./types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Folgas por Consultor</span>
            </CardTitle>
             <CardDescription>Total de folgas por consultor no mês atual.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Folgas</CardTitle>
            <CardDescription>Folgas agendadas para os próximos 7 dias.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Folgas por Consultor</span>
          </CardTitle>
          <CardDescription>Total de folgas por consultor no mês atual.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {consultoresComFolga.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 flex flex-col items-center justify-center h-full">
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              Nenhuma folga registrada no mês atual.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {consultoresComFolga.map((consultor) => (
                <Card key={consultor.id} className="shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between items-center text-center">
                  <CardHeader className="flex flex-col items-center space-y-2 pb-2 pt-4 px-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={consultor.avatar} alt={consultor.nome} />
                      <AvatarFallback>{consultor.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" title={consultor.nome}>{consultor.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Consultor(a)
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 px-4">
                    <div>
                      <p className="text-3xl font-bold">{consultor.folgas}</p>
                      <p className="text-xs text-muted-foreground">
                        {consultor.folgas === 1 ? "folga no mês" : "folgas no mês"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span>Próximas Folgas (7 dias)</span>
          </CardTitle>
          <CardDescription>Folgas agendadas para os próximos 7 dias.</CardDescription>
          {folgasProximos7Dias.length > 3 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="h-auto p-0 text-xs mt-1 self-start hover:underline"
            >
              {showAll ? (
                <>
                  Mostrar menos <ChevronUp className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  Ver todas ({folgasProximos7Dias.length}) <ChevronDown className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-grow">
          {folgasProximos7Dias.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 flex flex-col items-center justify-center h-full">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              Nenhuma folga nos próximos 7 dias.
            </div>
          ) : (
            <div className="space-y-3">
              {(showAll
                ? folgasProximos7Dias
                : folgasProximos7Dias.slice(0, 3)
              ).map((folga) => {
                const consultor = getConsultorById(folga.consultorId);
                return (
                  <div
                    key={folga.id}
                    className="flex items-start gap-3 p-3 border rounded-lg shadow-sm hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={consultor?.avatar} alt={consultor?.nome} />
                      <AvatarFallback className="text-xs">
                        {consultor ? consultor.nome.substring(0, 1).toUpperCase() : "-"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={consultor ? consultor.nome : "Consultor não encontrado"}>
                        {consultor ? consultor.nome : "Consultor não encontrado"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(folga.data), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      {folga.motivo && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="mt-1 flex items-center text-xs text-muted-foreground cursor-default">
                                <Info className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                <p className="truncate max-w-[180px] sm:max-w-[220px]">{folga.motivo}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs whitespace-pre-wrap">{folga.motivo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {folgasProximos7Dias.length > 3 && !showAll && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="w-full justify-center mt-3 text-sm"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
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
