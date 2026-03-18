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
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Pesquisar por nome ou código..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-12 bg-background border-2 border-border focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isSearching && (
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          {resultsCount > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">
                {resultsCount} cards encontrados
              </span>
              <span className="text-muted-foreground">
                de {totalCount} total
              </span>
            </div>
          ) : (
            <div className="text-sm text-center">
              <span className="text-amber-600 dark:text-amber-500 font-medium">
                Nenhum card encontrado para "{searchTerm}"
              </span>
              <div className="text-muted-foreground text-xs mt-1">
                Tente usar outros termos de pesquisa
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
