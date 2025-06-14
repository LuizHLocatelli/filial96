
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Cliente } from "@/components/crediario/types";
import { ContactHistory } from "../contacts/ContactHistory";
import { MessageTemplates } from "../templates/MessageTemplates";
import { useClienteTableLogic } from "./hooks/useClienteTableLogic";
import { TableFilters } from "./components/TableFilters";
import { MassActions } from "./components/MassActions";
import { ClienteTableRow } from "./components/ClienteTableRow";
import { EmptyState } from "./components/EmptyState";
import { calcularDiasAtraso } from "./utils/clienteUtils";

interface ClientesDataTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export function ClientesDataTable({ clientes, onEdit, onDelete }: ClientesDataTableProps) {
  const [selectedClienteForContact, setSelectedClienteForContact] = useState<Cliente | null>(null);
  const [selectedClienteForTemplate, setSelectedClienteForTemplate] = useState<Cliente | null>(null);

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
        <CardHeader>
          <CardTitle>Gestão de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <TableFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
          <MassActions
            selectedCount={selectedClientes.length}
            onWhatsApp={handleWhatsAppMassa}
            onCallList={handleListaLigacoes}
          />
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
