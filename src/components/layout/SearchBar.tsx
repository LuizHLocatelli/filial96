
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  isMobile: boolean;
  isSearchOpen: boolean;
  onSearchToggle: () => void;
}

export function SearchBar({ isMobile, isSearchOpen, onSearchToggle }: SearchBarProps) {
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchToggle}
          className="h-10 w-10"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </Button>
        
        {isSearchOpen && (
          <div className="border-t bg-background/95 backdrop-blur-lg p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10 pr-4 w-full"
                autoFocus
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex-1 max-w-md mx-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-10 pr-4 w-full bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
        />
      </div>
    </div>
  );
}
