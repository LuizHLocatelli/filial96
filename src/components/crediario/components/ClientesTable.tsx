
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Cliente, getIndicatorColor } from "../types";

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function ClientesTable({ clientes, onEdit, onDelete, onAddNew }: ClientesTableProps) {
  return (
    <>
      {clientes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">Nenhum cliente agendado</p>
          <Button className="mt-4" onClick={onAddNew}>
            Adicionar Cliente
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Indicador</TableHead>
              <TableHead>Data de Contato</TableHead>
              <TableHead>Data de Pagamento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell>{cliente.conta}</TableCell>
                <TableCell>
                  {cliente.tipo === "pagamento" ? "Pagamento" : "Renegociação"}
                </TableCell>
                <TableCell>
                  {cliente.indicator ? (
                    <Badge className={`${getIndicatorColor(cliente.indicator)} text-white`}>
                      {cliente.indicator}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(cliente.diaContato, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {format(cliente.diaPagamento, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(cliente)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(cliente.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
