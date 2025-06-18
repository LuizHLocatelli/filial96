import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cliente } from "@/components/crediario/types";
import { UserPlus, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClienteHeaderProps {
  clientes: Cliente[];
  clientesNoMes: Cliente[];
  onAddNew: () => void;
}

export function ClienteHeader({ clientes, clientesNoMes, onAddNew }: ClienteHeaderProps) {
  const clientesAtrasados = clientes.filter(cliente => {
    const hoje = new Date();
    const diaPagamento = new Date(cliente.diaPagamento);
    return diaPagamento < hoje;
  });

  const clientesEmDia = clientes.filter(cliente => {
    const hoje = new Date();
    const diaPagamento = new Date(cliente.diaPagamento);
    return diaPagamento >= hoje;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Clientes</h2>
          <p className="text-muted-foreground">Controle de pagamentos e renegociações</p>
        </div>
        <Button onClick={onAddNew} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid-responsive-stats gap-base">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{clientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">{clientesAtrasados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Dia</p>
                <p className="text-2xl font-bold text-green-600">{clientesEmDia.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold text-orange-600">{clientesNoMes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
