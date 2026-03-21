import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          type="text"
          placeholder="Pesquisar cards..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11 bg-muted/50 border-transparent focus:border-input focus:bg-background transition-all duration-200 text-foreground placeholder:text-muted-foreground rounded-xl"
        />
        <AnimatePresence>
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "rounded-xl p-3 border",
              resultsCount > 0 
                ? "bg-primary/5 border-primary/20" 
                : "bg-amber-500/5 border-amber-500/20"
            )}>
              {resultsCount > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
