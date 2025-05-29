import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, User, CalendarDays, Info, Calendar as CalendarIcon, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crediarista, Folga } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FolgasListProps {
  folgas: Folga[];
  getCrediaristaById: (id: string) => Crediarista | undefined;
  onDeleteFolga: (folgaId: string) => void;
  onAddFolga: () => void;
  getUserNameById?: (userId: string) => string | undefined;
}

export function FolgasList({ folgas, getCrediaristaById, onDeleteFolga, onAddFolga, getUserNameById }: FolgasListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrediarista, setSelectedCrediarista] = useState<string>("all");
  
  // Lista de crediaristas únicos para o filtro
  const crediaristas = useMemo(() => {
    const crediaristaIds = [...new Set(folgas.map(f => f.crediaristaId))];
    return crediaristaIds.map(id => getCrediaristaById(id)).filter(Boolean) as Crediarista[];
  }, [folgas, getCrediaristaById]);

  // Filtrar folgas baseado na busca e filtros
  const folgasFiltradas = useMemo(() => {
    return folgas.filter(folga => {
      const crediarista = getCrediaristaById(folga.crediaristaId);
      const crediaristaMatch = selectedCrediarista === "all" || folga.crediaristaId === selectedCrediarista;
      const searchMatch = searchTerm === "" || 
        (crediarista?.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (folga.motivo?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return crediaristaMatch && searchMatch;
    }).sort((a, b) => b.data.getTime() - a.data.getTime());
  }, [folgas, searchTerm, selectedCrediarista, getCrediaristaById]);

  return (
    <Card className="border shadow-soft">
      <CardHeader>
        <CardTitle>Lista de Folgas</CardTitle>
        <CardDescription>Gerencie todas as folgas registradas dos crediaristas</CardDescription>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por crediarista ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select value={selectedCrediarista} onValueChange={setSelectedCrediarista}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por crediarista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os crediaristas</SelectItem>
                {crediaristas.map((crediarista) => (
                  <SelectItem key={crediarista.id} value={crediarista.id}>
                    {crediarista.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {(searchTerm || selectedCrediarista !== "all") && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {folgasFiltradas.length} de {folgas.length} folgas
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCrediarista("all");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {folgasFiltradas.length === 0 ? (
          <div className="text-center py-6">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {folgas.length === 0 ? "Nenhuma folga registrada" : "Nenhuma folga encontrada com os filtros aplicados"}
            </p>
            {folgas.length === 0 && (
              <Button className="mt-4" onClick={onAddFolga}>
                Adicionar Folga
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {folgasFiltradas.map((folga) => {
              const crediarista = getCrediaristaById(folga.crediaristaId);
              return (
                <Card key={folga.id} className="border shadow-sm hover:shadow-md transition-shadow">
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
