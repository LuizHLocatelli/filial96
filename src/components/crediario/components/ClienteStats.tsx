import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cliente } from "../types";

interface ClienteStatsProps {
  clientes: Cliente[];
  clientesNoMes: Cliente[];
}

export function ClienteStats({ clientes, clientesNoMes }: ClienteStatsProps) {
  return (
    <Card className="w-full md:w-auto border shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle>Resumo de Agendamentos</CardTitle>
        <CardDescription>Visão geral dos clientes agendados</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Total de Agendamentos</span>
            <span className="text-2xl font-bold">{clientes.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Pagamentos Simples</span>
            <span className="text-2xl font-bold">
              {clientes.filter(c => c.tipo === 'pagamento').length}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Renegociações</span>
            <span className="text-2xl font-bold">
              {clientes.filter(c => c.tipo === 'renegociacao').length}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">Este Mês</span>
            <span className="text-2xl font-bold">
              {clientesNoMes.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
