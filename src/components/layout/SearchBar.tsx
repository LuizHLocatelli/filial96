import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";
import { GlobalSearchResults } from "./GlobalSearchResults";
import { useEffect, useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";

interface SearchBarProps {
  isMobile: boolean;
  isSearchOpen: boolean;
  onSearchToggle: () => void;
}

export function SearchBar({ isMobile, isSearchOpen, onSearchToggle }: SearchBarProps) {
  const { searchTerm, performSearch, clearSearch } = useGlobalSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchOpen && isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen, isMobile]);

  // Fechar pesquisa ao clicar fora (apenas para desktop)
  useOnClickOutside(searchContainerRef, () => {
    if (!isMobile && searchTerm) {
      clearSearch();
    }
  });

  // Fechar pesquisa ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (searchTerm) {
          clearSearch();
        }
        if (isMobile && isSearchOpen) {
          onSearchToggle();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [searchTerm, clearSearch, isMobile, isSearchOpen, onSearchToggle]);

  const handleInputChange = (value: string) => {
    performSearch(value);
  };

  const handleClearSearch = () => {
    clearSearch();
    if (isMobile) {
      onSearchToggle();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClearSearch();
    }
  };

  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onSearchToggle}
        className="h-10 w-10"
        aria-label="Buscar"
      >
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex-1 max-w-md mx-8 relative" ref={searchContainerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Buscar páginas, seções..."
          className="pl-10 pr-4 w-full bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <GlobalSearchResults onResultClick={handleClearSearch} />
    </div>
  );
}
