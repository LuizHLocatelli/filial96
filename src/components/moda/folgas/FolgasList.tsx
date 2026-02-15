import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, User, CalendarDays, Info, Calendar as CalendarIcon, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Folga } from "./types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FolgasListProps {
  folgas: Folga[];
  isLoading: boolean;
  handleDeleteFolga: (folgaId: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConsultor, setSelectedConsultor] = useState<string>("all");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [folgaToDelete, setFolgaToDelete] = useState<Folga | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Lista de consultores únicos para o filtro
  const consultores = useMemo(() => {
    const consultorIds = [...new Set(folgas.map(f => f.consultorId))];
    return consultorIds.map(id => getConsultorById(id)).filter(Boolean);
  }, [folgas, getConsultorById]);

  // Filtrar folgas baseado na busca e filtros
  const folgasFiltradas = useMemo(() => {
    return folgas.filter(folga => {
      const consultor = getConsultorById(folga.consultorId);
      const consultorMatch = selectedConsultor === "all" || folga.consultorId === selectedConsultor;
      const searchMatch = searchTerm === "" || 
        (consultor?.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (folga.motivo?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return consultorMatch && searchMatch;
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [folgas, searchTerm, selectedConsultor, getConsultorById]);

  const handleDeleteClick = (folga: Folga) => {
    setFolgaToDelete(folga);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!folgaToDelete) return;

    try {
      setDeletingIds(prev => new Set(prev).add(folgaToDelete.id));
      await handleDeleteFolga(folgaToDelete.id);
    } catch (error) {
      console.error("Erro ao excluir folga:", error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(folgaToDelete.id);
        return newSet;
      });
      setShowDeleteDialog(false);
      setFolgaToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setFolgaToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Folgas</CardTitle>
          <CardDescription>Gerencie todas as folgas registradas dos consultores de moda</CardDescription>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por consultor ou motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <Select value={selectedConsultor} onValueChange={setSelectedConsultor}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por consultor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os consultores</SelectItem>
                  {consultores.map((consultor) => (
                    <SelectItem key={consultor.id} value={consultor.id}>
                      {consultor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || selectedConsultor !== "all") && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {folgasFiltradas.length} de {folgas.length} folgas
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedConsultor("all");
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
            </div>
          ) : (
            <div className="space-y-4">
              {folgasFiltradas.map((folga) => {
                const consultor = getConsultorById(folga.consultorId);
                const consultorName = consultor ? consultor.nome : "Consultor não encontrado";
                const isDeleting = deletingIds.has(folga.id);

                return (
                  <Card 
                    key={folga.id} 
                    className={`shadow-sm hover:shadow-md transition-all duration-200 ${
                      isDeleting ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
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
                            <span>{format(folga.data, "dd/MM/yyyy", { locale: ptBR })}</span>
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
                            onClick={() => handleDeleteClick(folga)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {isDeleting ? "Excluindo..." : "Excluir"}
                            </span>
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

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a folga de{" "}
              <strong>
                {folgaToDelete && getConsultorById(folgaToDelete.consultorId)?.nome}
              </strong>{" "}
              para o dia{" "}
              <strong>
                {folgaToDelete && format(folgaToDelete.data, "dd/MM/yyyy", { locale: ptBR })}
              </strong>
              ?
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Folga
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 