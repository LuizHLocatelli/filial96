import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, User, CalendarDays, Info, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Folga } from "./types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FolgasListProps {
  folgas: Folga[];
  isLoading: boolean;
  handleDeleteFolga: (folgaId: string) => void;
  getConsultorById: (id: string) => any;
  getUserNameById?: (userId: string) => string | undefined;
}

export function FolgasList({
  folgas,
  isLoading,
  handleDeleteFolga,
  getConsultorById,
  getUserNameById,
}: FolgasListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Folgas</CardTitle>
        <CardDescription>Gerencie todas as folgas registradas dos consultores de móveis</CardDescription>
      </CardHeader>
      <CardContent>
        {folgas.length === 0 ? (
          <div className="text-center py-6">
             <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhuma folga registrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...folgas]
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((folga) => {
                const consultor = getConsultorById(folga.consultorId);
                const consultorName = consultor ? consultor.nome : "Consultor não encontrado";

                return (
                  <Card key={folga.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div className="flex-1 mb-3 sm:mb-0">
                          <div className="flex items-center mb-2">
                            <User className="h-5 w-5 mr-2 text-primary" />
                            <span className="font-semibold text-lg">
                              {consultorName}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            <span>{format(new Date(folga.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          {folga.motivo && (
                            <div className="flex items-start text-sm text-muted-foreground">
                              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="text-left">
                                    <p className="truncate max-w-[200px] sm:max-w-xs">
                                      {folga.motivo}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs whitespace-pre-wrap">{folga.motivo}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                          {folga.createdAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Registrado em: {format(new Date(folga.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                              {folga.createdBy && (
                                <>
                                  {` por ${getUserNameById && folga.createdBy ? getUserNameById(folga.createdBy) || folga.createdBy : folga.createdBy}`}
                                </>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex sm:flex-col items-end sm:items-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 h-9 w-9 p-0"
                            onClick={() => handleDeleteFolga(folga.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
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
