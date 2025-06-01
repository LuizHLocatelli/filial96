
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  Calendar,
  AlertTriangle,
  Check,
  X,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cliente, getIndicatorColor } from "@/components/crediario/types";
import { ContactHistory } from "../contacts/ContactHistory";
import { MessageTemplates } from "../templates/MessageTemplates";

interface ClientesDataTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export function ClientesDataTable({ clientes, onEdit, onDelete }: ClientesDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedClientes, setSelectedClientes] = useState<string[]>([]);
  const [selectedClienteForContact, setSelectedClienteForContact] = useState<Cliente | null>(null);
  const [selectedClienteForTemplate, setSelectedClienteForTemplate] = useState<Cliente | null>(null);
  const [sortField, setSortField] = useState<keyof Cliente | "diasAtraso">("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Função para calcular dias em atraso (simulado baseado na data de pagamento)
  const calcularDiasAtraso = (cliente: Cliente): number => {
    const hoje = new Date();
    const diasAtraso = differenceInDays(hoje, cliente.diaPagamento);
    return Math.max(0, diasAtraso);
  };

  // Filtrar e ordenar clientes
  const filteredAndSortedClientes = useMemo(() => {
    let filtered = clientes.filter(cliente => {
      const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.conta.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === "all" || 
                           (filterStatus === "atrasados" && calcularDiasAtraso(cliente) > 0) ||
                           (filterStatus === "em_dia" && calcularDiasAtraso(cliente) === 0) ||
                           cliente.indicator === filterStatus;
      
      return matchesSearch && matchesFilter;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "diasAtraso") {
        aValue = calcularDiasAtraso(a);
        bValue = calcularDiasAtraso(b);
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [clientes, searchTerm, filterStatus, sortField, sortDirection]);

  const handleSort = (field: keyof Cliente | "diasAtraso") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectCliente = (clienteId: string, checked: boolean) => {
    if (checked) {
      setSelectedClientes(prev => [...prev, clienteId]);
    } else {
      setSelectedClientes(prev => prev.filter(id => id !== clienteId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClientes(filteredAndSortedClientes.map(c => c.id));
    } else {
      setSelectedClientes([]);
    }
  };

  const getStatusBadge = (cliente: Cliente) => {
    const diasAtraso = calcularDiasAtraso(cliente);
    
    if (diasAtraso === 0) {
      return <Badge className="bg-green-100 text-green-800">Em dia</Badge>;
    } else if (diasAtraso <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">{diasAtraso}d atraso</Badge>;
    } else if (diasAtraso <= 30) {
      return <Badge className="bg-orange-100 text-orange-800">{diasAtraso}d atraso</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{diasAtraso}d atraso</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou conta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="em_dia">Em dia</SelectItem>
                <SelectItem value="atrasados">Atrasados</SelectItem>
                <SelectItem value="FPD">FPD</SelectItem>
                <SelectItem value="M1">M1</SelectItem>
                <SelectItem value="M2">M2</SelectItem>
                <SelectItem value="M3">M3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ações em Massa */}
          {selectedClientes.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
              <span className="text-sm font-medium">
                {selectedClientes.length} cliente(s) selecionado(s)
              </span>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageSquare className="h-3 w-3" />
                WhatsApp em Massa
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Phone className="h-3 w-3" />
                Lista de Ligações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedClientes.length === filteredAndSortedClientes.length && filteredAndSortedClientes.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("nome")}
                  >
                    Nome {sortField === "nome" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("conta")}
                  >
                    Conta {sortField === "conta" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("diasAtraso")}
                  >
                    Status {sortField === "diasAtraso" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("diaPagamento")}
                  >
                    Pagamento {sortField === "diaPagamento" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedClientes.includes(cliente.id)}
                        onCheckedChange={(checked) => handleSelectCliente(cliente.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.conta}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cliente.tipo === "pagamento" ? "Pagamento" : "Renegociação"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cliente.indicator ? (
                        <Badge className={`${getIndicatorColor(cliente.indicator)} text-white`}>
                          {cliente.indicator}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(cliente)}</TableCell>
                    <TableCell>
                      {format(cliente.diaPagamento, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClienteForContact(cliente)}
                          className="gap-1"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClienteForTemplate(cliente)}
                          className="gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(cliente)}
                          className="gap-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(cliente.id)}
                          className="gap-1 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredAndSortedClientes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum cliente encontrado com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={!!selectedClienteForContact} onOpenChange={() => setSelectedClienteForContact(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Contatos</DialogTitle>
          </DialogHeader>
          {selectedClienteForContact && (
            <ContactHistory
              clienteId={selectedClienteForContact.id}
              clienteName={selectedClienteForContact.nome}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedClienteForTemplate} onOpenChange={() => setSelectedClienteForTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates de Mensagem</DialogTitle>
          </DialogHeader>
          {selectedClienteForTemplate && (
            <MessageTemplates
              clienteName={selectedClienteForTemplate.nome}
              valorDevido={parseFloat(selectedClienteForTemplate.valorParcelas || "0")}
              diasAtraso={calcularDiasAtraso(selectedClienteForTemplate)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
