
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CardSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  totalCount: number;
  isSearching: boolean;
  className?: string;
}

export function CardSearchBar({
  searchTerm,
  onSearchChange,
  resultsCount,
  totalCount,
  isSearching,
  className
}: CardSearchBarProps) {
  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Pesquisar por nome ou código..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11 bg-background/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 transition-all duration-200"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isSearching && (
        <div className="text-sm text-muted-foreground px-1">
          {resultsCount > 0 ? (
            <span>
              {resultsCount} de {totalCount} cards encontrados
            </span>
          ) : (
            <span className="text-orange-600">
              Nenhum card encontrado para "{searchTerm}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
