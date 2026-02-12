
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

interface CartazSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  totalCount: number;
  isSearching: boolean;
  monthFilter: string;
  onMonthFilterChange: (value: string) => void;
}

export function CartazSearchBar({
  searchTerm,
  onSearchChange,
  resultsCount,
  totalCount,
  isSearching,
  monthFilter,
  onMonthFilterChange
}: CartazSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Pesquisar cartazes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <select
        value={monthFilter}
        onChange={(e) => onMonthFilterChange(e.target.value)}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[140px]"
      >
        <option value="">Todos os meses</option>
        {Array.from({ length: 5 }, (_, i) => {
          const year = new Date().getFullYear() - 2 + i;
          return MONTHS.map(m => (
            <option key={`${year}-${m.value}`} value={`${year}-${m.value}`}>
              {m.label} {year}
            </option>
          ));
        })}
      </select>
      
      {isSearching && (
        <Badge variant="secondary" className="text-sm">
          {resultsCount} de {totalCount} cartazes
        </Badge>
      )}
    </div>
  );
}
