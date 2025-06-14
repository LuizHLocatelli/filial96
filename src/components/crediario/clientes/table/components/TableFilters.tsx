
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface TableFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
}

export function TableFilters({
  searchTerm,
  onSearchTermChange,
  filterStatus,
  onFilterStatusChange,
}: TableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou conta..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filtrar status..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="em_dia">Em dia</SelectItem>
          <SelectItem value="atrasados">Atrasados</SelectItem>
          <SelectItem value="FPD">FPD</SelectItem>
          <SelectItem value="M1">M1</SelectItem>
          <SelectItem value="M2">M2</SelectItem>
          <SelectItem value="M3">M3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
