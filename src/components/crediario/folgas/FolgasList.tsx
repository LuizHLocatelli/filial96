
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crediarista, Folga } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FolgasListProps {
  folgas: Folga[];
  getCrediaristaById: (id: string) => Crediarista | undefined;
  onDeleteFolga: (folgaId: string) => void;
  onAddFolga: () => void;
}

export function FolgasList({ folgas, getCrediaristaById, onDeleteFolga, onAddFolga }: FolgasListProps) {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crediarista</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folgas
                .sort((a, b) => b.data.getTime() - a.data.getTime())
                .map((folga) => {
                  const crediarista = getCrediaristaById(folga.crediaristaId);
                  return (
                    <TableRow key={folga.id}>
                      <TableCell className="font-medium">
                        {crediarista?.nome || "Desconhecido"}
                      </TableCell>
                      <TableCell>
                        {format(folga.data, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {folga.motivo ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="text-left truncate max-w-[200px] block">
                                {folga.motivo}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{folga.motivo}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não informado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteFolga(folga.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
