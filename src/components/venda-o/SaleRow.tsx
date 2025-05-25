import { format, parseISO } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";
import { VendaO, statusOptions } from "@/types/vendaO";

interface SaleRowProps {
  sale: VendaO;
  isChangingStatus: boolean;
  onStatusChange: (id: string, status: string) => void;
  onViewDetails: (sale: VendaO) => void;
  onDeleteClick: (sale: VendaO) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export function SaleRow({
  sale,
  isChangingStatus,
  onStatusChange,
  onViewDetails,
  onDeleteClick,
  getStatusBadge,
}: SaleRowProps) {
  return (
    <TableRow key={sale.id}>
      <TableCell className="font-medium text-xs sm:text-sm">
        {format(parseISO(sale.data_venda), "dd/MM/yyyy")}
      </TableCell>
      <TableCell className="hidden md:table-cell text-xs sm:text-sm">{sale.nome_cliente}</TableCell>
      <TableCell className="hidden md:table-cell text-xs sm:text-sm">{sale.filial}</TableCell>
      <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
        {Array.isArray(sale.produtos) ? sale.produtos.length : 'N/A'} item(ns)
      </TableCell>
      <TableCell>
        <Select
          value={sale.status}
          onValueChange={(value) => onStatusChange(sale.id, value)}
          disabled={isChangingStatus}
        >
          <SelectTrigger className="w-[120px] sm:w-[180px] text-xs sm:text-sm">
            {/* Este SelectValue precisa de um filho para renderizar o badge corretamente */}
            {/* Envolvendo getStatusBadge em um span para garantir que seja um ReactNode válido aqui */}
            <SelectValue><span>{getStatusBadge(sale.status)}</span></SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex space-x-1 sm:space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => onViewDetails(sale)}
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => onDeleteClick(sale)}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
} 