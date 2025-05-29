import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, User, CalendarDays, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crediarista, Folga } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface FolgasListProps {
  folgas: Folga[];
  getCrediaristaById: (id: string) => Crediarista | undefined;
  onDeleteFolga: (folgaId: string) => void;
  onAddFolga: () => void;
  getUserNameById?: (userId: string) => string | undefined;
}

export function FolgasList({ folgas, getCrediaristaById, onDeleteFolga, onAddFolga, getUserNameById }: FolgasListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Folgas</CardTitle>
        <CardDescription>Gerencie todas as folgas registradas</CardDescription>
      </CardHeader>
      <CardContent>
        {folgas.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Nenhuma folga registrada</p>
            <Button className="mt-4" onClick={onAddFolga}>
              Adicionar Folga
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {folgas
              .sort((a, b) => b.data.getTime() - a.data.getTime())
              .map((folga) => {
                const crediarista = getCrediaristaById(folga.crediaristaId);
                return (
                  <Card key={folga.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div className="flex-1 mb-3 sm:mb-0">
                          <div className="flex items-center mb-2">
                            <User className="h-5 w-5 mr-2 text-primary" />
                            <span className="font-semibold text-lg">
                              {crediarista?.nome || "Desconhecido"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            <span>{format(folga.data, "dd/MM/yyyy")}</span>
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
                              Registrado em: {format(new Date(folga.createdAt), "dd/MM/yy HH:mm")}
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
                            onClick={() => onDeleteFolga(folga.id)}
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
