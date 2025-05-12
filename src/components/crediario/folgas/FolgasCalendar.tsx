
import { format, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crediarista, Folga } from "./types";

interface FolgasCalendarProps {
  currentMonth: Date;
  weeks: Date[][];
  crediaristas: Crediarista[];
  folgas: Folga[];
  isLoadingCrediaristas: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function FolgasCalendar({
  currentMonth,
  weeks,
  crediaristas,
  folgas,
  isLoadingCrediaristas,
  onPrevMonth,
  onNextMonth
}: FolgasCalendarProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Calendário de Folgas</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={onPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Visualização de folgas por crediarista durante o mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingCrediaristas ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : crediaristas.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Nenhum crediarista encontrado para exibir no calendário
            </p>
          </div>
        ) : (
          <>
            {weeks.map((week, weekIndex) => (
              <Table key={`week-${weekIndex}`} className={weekIndex > 0 ? "mt-4" : ""}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">
                      {weekIndex === 0 && "Crediarista"}
                    </TableHead>
                    {week.map((day) => (
                      <TableHead key={day.toString()} className="text-center p-1">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">
                            {format(day, "EEE", { locale: ptBR })}
                          </span>
                          <span className={cn(
                            "font-medium",
                            !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50"
                          )}>
                            {day.getDate()}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crediaristas.map((crediarista) => (
                    <TableRow key={`${crediarista.id}-week-${weekIndex}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span>{crediarista.nome}</span>
                        </div>
                      </TableCell>
                      {week.map((day) => {
                        // Verificar se existe folga para este crediarista neste dia
                        const folga = folgas.find(
                          (folga) =>
                            folga.crediaristaId === crediarista.id &&
                            isSameDay(folga.data, day)
                        );
                        
                        return (
                          <TableCell key={day.toString()} className="text-center p-1">
                            {folga && (
                              <div 
                                className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto cursor-pointer"
                                title={`Folga de ${crediarista.nome} em ${format(day, "dd/MM/yyyy")}`}
                              >
                                <span className="h-2 w-2 bg-blue-500 rounded-full" />
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
