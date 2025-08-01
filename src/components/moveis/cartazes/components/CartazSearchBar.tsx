
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CartazSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  totalCount: number;
  isSearching: boolean;
}

export function CartazSearchBar({
  searchTerm,
  onSearchChange,
  resultsCount,
  totalCount,
  isSearching
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
      
      {isSearching && (
        <Badge variant="secondary" className="text-sm">
          {resultsCount} de {totalCount} cartazes
        </Badge>
      )}
    </div>
  );
}
