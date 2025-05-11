
import { Button } from "@/components/ui/button";
import { ClienteStats } from "../components/ClienteStats";
import { Cliente } from "../types";

interface ClienteHeaderProps {
  clientes: Cliente[];
  clientesNoMes: Cliente[];
  onAddNew: () => void;
}

export function ClienteHeader({ clientes, clientesNoMes, onAddNew }: ClienteHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <ClienteStats clientes={clientes} clientesNoMes={clientesNoMes} />
      
      <Button className="md:w-auto w-full" onClick={onAddNew}>
        Adicionar Cliente
      </Button>
    </div>
  );
}
