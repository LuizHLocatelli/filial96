import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MapPin,
  Phone,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Brain,
} from "lucide-react";

import { Frete } from "@/types/frete";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface FretesListProps {
  fretes: Frete[];
  loading: boolean;
  onEdit: (frete: Frete) => void;
  onDelete: (id: string) => void;
  onView: (frete: Frete) => void;
}

const STATUS_COLORS = {
  'Pendente de Entrega': 'default',
  'Em Transporte': 'secondary',
  'Entregue': 'success',
  'Cancelado': 'destructive',
} as const;

const STATUS_ICONS = {
  'Pendente de Entrega': Clock,
  'Em Transporte': Truck,
  'Entregue': CheckCircle,
  'Cancelado': XCircle,
};

export function FretesList({ fretes, loading, onEdit, onDelete, onView }: FretesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [freteToDelete, setFreteToDelete] = useState<string | null>(null);

  const filteredFretes = fretes.filter(frete => {
    const matchesSearch = frete.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         frete.telefone.includes(searchTerm) ||
                         (frete.cpf_cliente && frete.cpf_cliente.includes(searchTerm));

    const matchesStatus = statusFilter === "all" || frete.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (id: string) => {
    setFreteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (freteToDelete) {
      onDelete(freteToDelete);
      setDeleteDialogOpen(false);
      setFreteToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando fretes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Fretes ({filteredFretes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[120px]">
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter === "all" ? "Todos" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    Todos os Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Pendente de Entrega")}>
                    Pendente de Entrega
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Em Transporte")}>
                    Em Transporte
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Entregue")}>
                    Entregue
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Cancelado")}>
                    Cancelado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fretes */}
      {filteredFretes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum frete encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando seu primeiro frete"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Versão Mobile - Cards */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {filteredFretes.map((frete) => {
                  const StatusIcon = STATUS_ICONS[frete.status];
                  return (
                    <Card key={frete.id} className="border-l-4" style={{
                      borderLeftColor: frete.status === 'Entregue' ? '#10B981' :
                                     frete.status === 'Em Transporte' ? '#F59E0B' :
                                     frete.status === 'Cancelado' ? '#EF4444' : '#6B7280'
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{frete.nome_cliente}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Phone className="h-3 w-3" />
                              {formatPhoneNumber(frete.telefone)}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onView(frete)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(frete)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(frete.id!)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant={STATUS_COLORS[frete.status] as any} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {frete.status}
                          </Badge>
                          {frete.pago && (
                            <Badge variant="success">Pago</Badge>
                          )}
                          {frete.processamento_ia_confidence && (
                            <Badge variant="secondary" className="gap-1">
                              <Brain className="h-3 w-3" />
                              IA: {frete.processamento_ia_confidence}%
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {frete.endereco_entrega}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {formatDate(frete.created_at!)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Frete:</span>
                            <span className="font-medium">{formatCurrency(frete.valor_frete)}</span>
                          </div>
                          {frete.valor_total_nota && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total NF:</span>
                              <span className="text-sm">{formatCurrency(frete.valor_total_nota)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Versão Desktop - Tabela */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor Frete</TableHead>
                    <TableHead>Valor NF</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>IA</TableHead>
                    <TableHead width="50"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFretes.map((frete) => {
                    const StatusIcon = STATUS_ICONS[frete.status];
                    return (
                      <TableRow key={frete.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{frete.nome_cliente}</div>
                            {frete.cpf_cliente && (
                              <div className="text-sm text-muted-foreground">
                                CPF: {frete.cpf_cliente}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {formatPhoneNumber(frete.telefone)}
                            </div>
                            <div className="flex items-start gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {frete.endereco_entrega}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={STATUS_COLORS[frete.status] as any} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {frete.status}
                            </Badge>
                            {frete.pago && (
                              <Badge variant="success" size="sm">Pago</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(frete.valor_frete)}
                        </TableCell>
                        <TableCell>
                          {frete.valor_total_nota
                            ? formatCurrency(frete.valor_total_nota)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(frete.created_at!)}
                        </TableCell>
                        <TableCell>
                          {frete.processamento_ia_confidence ? (
                            <Badge variant="secondary" className="gap-1">
                              <Brain className="h-3 w-3" />
                              {frete.processamento_ia_confidence}%
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onView(frete)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(frete)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(frete.id!)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este frete? Esta ação não pode ser desfeita
              e todos os dados relacionados serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}