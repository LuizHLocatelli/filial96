import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Loader2, Calendar as CalendarIcon, Clock, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { fetchEscalas } from "./services/escalasApi";
import { GeradorEscalaDialog } from "./GeradorEscalaDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Escalas() {
  const { profile } = useAuth();
  const isManager = profile?.role === "gerente";
  
  const [showGerador, setShowGerador] = useState(false);
  const [currentDate] = useState(new Date());

  // Show current month
  const startDateStr = format(new Date(), "yyyy-MM-01");
  const endDateStr = format(addDays(new Date(startDateStr), 60), "yyyy-MM-dd");

  const queryClient = useQueryClient();
  const { data: escalas, isLoading, refetch } = useQuery({
    queryKey: ["escalas", startDateStr, endDateStr],
    queryFn: () => fetchEscalas(startDateStr, endDateStr),
  });

  // Group by date
  const escalasByDate = useMemo(() => {
    if (!escalas) return {};
    
    return escalas.reduce((acc, escala) => {
      if (!acc[escala.date]) {
        acc[escala.date] = [];
      }
      acc[escala.date].push(escala);
      return acc;
    }, {} as Record<string, typeof escalas>);
  }, [escalas]);

  const uniqueDates = Object.keys(escalasByDate).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Escala de Carga</h2>
          <p className="text-muted-foreground">
            Gerencie os horários de entrada e saída da equipe.
          </p>
        </div>
        
        {isManager && (
          <Button onClick={() => setShowGerador(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Gerar Escala com IA
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando escalas...</p>
        </div>
      ) : uniqueDates.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <CalendarIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Nenhuma escala encontrada</h3>
              <p className="text-muted-foreground max-w-sm">
                Ainda não há escalas geradas para este período.
                {isManager && " Clique no botão acima para gerar uma nova escala usando a Inteligência Artificial."}
              </p>
            </div>
            {isManager && (
              <Button onClick={() => setShowGerador(true)} variant="outline" className="mt-4">
                Gerar Primeira Escala
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {uniqueDates.map(dateStr => {
            const dateEscalas = escalasByDate[dateStr];
            const dateObj = new Date(dateStr + 'T12:00:00'); // Prevent timezone shift
            const dayOfWeek = format(dateObj, "EEEE", { locale: ptBR });
            const isMirrorDay = ["terça-feira", "quinta-feira", "sábado"].includes(dayOfWeek.toLowerCase());
            
            return (
              <Card key={dateStr} className="glass-card overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2 capitalize">
                        {dayOfWeek}
                      </CardTitle>
                      <CardDescription>
                        {format(dateObj, "dd 'de' MMMM", { locale: ptBR })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {/* Carga Shift First */}
                    {dateEscalas.filter(e => e.is_carga).map(escala => (
                      <div key={escala.id} className="p-3 flex items-center justify-between bg-primary/5 hover:bg-primary/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border-2 border-primary/20">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <AvatarImage src={(escala.user as any)?.avatar_url || ''} />
                            <AvatarFallback>{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}{(escala.user as any)?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <span className="text-sm font-medium leading-none">{(escala.user as any)?.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Truck className="h-3 w-3 text-primary" />
                              {isMirrorDay ? "Espelho Carga" : "Carga"}
                            </span>
                          </div>
                        </div>
                        <Badge variant="default" className="flex items-center gap-1 shadow-sm">
                          <Clock className="h-3 w-3" />
                          {escala.shift_start.substring(0, 5)} - {escala.shift_end.substring(0, 5)}
                        </Badge>
                      </div>
                    ))}
                    
                    {/* Normal Shift */}
                    {dateEscalas.filter(e => !e.is_carga).map(escala => (
                      <div key={escala.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <AvatarImage src={(escala.user as any)?.avatar_url || ''} />
                            <AvatarFallback>{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}{(escala.user as any)?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <span className="text-sm font-medium leading-none">{(escala.user as any)?.name}</span>
                            <span className="text-xs text-muted-foreground mt-1">Normal</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {escala.shift_start.substring(0, 5)} - {escala.shift_end.substring(0, 5)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showGerador && (
        <GeradorEscalaDialog 
          open={showGerador} 
          onOpenChange={setShowGerador} 
          onSuccess={() => {
            refetch();
            queryClient.invalidateQueries({ queryKey: ["escalas"] });
          }}
        />
      )}
    </div>
  );
}
