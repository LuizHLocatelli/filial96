
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Cliente, getIndicatorColor } from "@/components/crediario/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { ActionButtons } from "./ActionButtons";

interface ClienteTableRowProps {
  cliente: Cliente;
  isSelected: boolean;
  onSelectCliente: (id: string, checked: boolean) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onContactHistory: (cliente: Cliente) => void;
  onMessageTemplate: (cliente: Cliente) => void;
}

export function ClienteTableRow({
  cliente,
  isSelected,
  onSelectCliente,
  onEdit,
  onDelete,
  onContactHistory,
  onMessageTemplate,
}: ClienteTableRowProps) {
  return (
    <TableRow key={cliente.id} className="hover:bg-muted/50" data-state={isSelected ? "selected" : ""}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectCliente(cliente.id, checked as boolean)}
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
      <TableCell><ClienteStatusBadge cliente={cliente} /></TableCell>
      <TableCell>
        {format(new Date(cliente.diaPagamento), "dd/MM/yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell>
        <ActionButtons
          cliente={cliente}
          onEdit={onEdit}
          onDelete={onDelete}
          onContactHistory={onContactHistory}
          onMessageTemplate={onMessageTemplate}
        />
      </TableCell>
    </TableRow>
  );
}
