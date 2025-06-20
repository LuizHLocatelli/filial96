import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Cliente } from "@/components/crediario/types";
import { ContactHistory } from "../contacts/ContactHistory";
import { MessageTemplates } from "../templates/MessageTemplates";
import { useClienteTableLogic } from "./hooks/useClienteTableLogic";
import { ClienteTableRow } from "./components/ClienteTableRow";
import { EmptyState } from "./components/EmptyState";
import { calcularDiasAtraso } from "./utils/clienteUtils";
import { Search, MessageSquare, Phone, History, Send } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface ClientesDataTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export function ClientesDataTable({ clientes, onEdit, onDelete }: ClientesDataTableProps) {
  const [selectedClienteForContact, setSelectedClienteForContact] = useState<Cliente | null>(null);
  const [selectedClienteForTemplate, setSelectedClienteForTemplate] = useState<Cliente | null>(null);

  const { getMobileDialogProps } = useMobileDialog();

  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedClientes,
    sortField,
    sortDirection,
    filteredAndSortedClientes,
    handleSort,
    handleSelectCliente,
    handleSelectAll,
    handleWhatsAppMassa,
    handleListaLigacoes,
  } = useClienteTableLogic(clientes);

  const isAllSelected = selectedClientes.length === filteredAndSortedClientes.length && filteredAndSortedClientes.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou conta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="atrasados">Em Atraso</SelectItem>
                <SelectItem value="em_dia">Em Dia</SelectItem>
                <SelectItem value="FPD">FPD</SelectItem>
                <SelectItem value="M1">M1</SelectItem>
                <SelectItem value="M2">M2</SelectItem>
                <SelectItem value="M3">M3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedClientes.length > 0 && (
            <div className="flex gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedClientes.length} cliente(s) selecionado(s)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppMassa}
                className="ml-auto gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp em Massa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleListaLigacoes}
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                Lista de Ligações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
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
                  <ClienteTableRow
                    key={cliente.id}
                    cliente={cliente}
                    isSelected={selectedClientes.includes(cliente.id)}
                    onSelectCliente={handleSelectCliente}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onContactHistory={setSelectedClienteForContact}
                    onMessageTemplate={setSelectedClienteForTemplate}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredAndSortedClientes.length === 0 && <EmptyState />}
        </CardContent>
      </Card>

      <Dialog open={!!selectedClienteForContact} onOpenChange={() => setSelectedClienteForContact(null)}>
        <DialogContent {...getMobileDialogProps("default")}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <History className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Histórico de Contatos
            </DialogTitle>
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
        <DialogContent {...getMobileDialogProps("default")}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Templates de Mensagem
            </DialogTitle>
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
