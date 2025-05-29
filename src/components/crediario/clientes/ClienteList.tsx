import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientesTable } from "../components/ClientesTable";
import { Cliente, indicatorOptions } from "../types";
import { Filter } from "lucide-react";
import { useState } from "react";

interface ClienteListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function ClienteList({ clientes, onEdit, onDelete, onAddNew }: ClienteListProps) {
  const [filterIndicator, setFilterIndicator] = useState<string | null>(null);
  
  const filteredClientes = filterIndicator 
    ? clientes.filter(cliente => cliente.indicator === filterIndicator)
    : clientes;
    
  return (
    <Card className="border shadow-soft">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Lista de Clientes Agendados</CardTitle>
            <CardDescription>
              Todos os clientes com agendamentos de pagamento ou renegociação
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterIndicator || "all"} onValueChange={(value) => setFilterIndicator(value === "all" ? null : value)}>
              <SelectTrigger className="w-[180px] bg-muted/40">
                <SelectValue placeholder="Todos indicadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos indicadores</SelectItem>
                {indicatorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ClientesTable 
          clientes={filteredClientes}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddNew={onAddNew}
        />
      </CardContent>
    </Card>
  );
}
