
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientesTable } from "../components/ClientesTable";
import { Cliente } from "../types";

interface ClienteListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function ClienteList({ clientes, onEdit, onDelete, onAddNew }: ClienteListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Clientes Agendados</CardTitle>
        <CardDescription>
          Todos os clientes com agendamentos de pagamento ou renegociação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClientesTable 
          clientes={clientes}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddNew={onAddNew}
        />
      </CardContent>
    </Card>
  );
}
