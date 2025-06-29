
import { useState, useMemo } from "react";
import { CartazItem } from "./useCartazes";

export function useCartazSearch(cartazes: CartazItem[]) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCartazes = useMemo(() => {
    if (!searchTerm.trim()) return cartazes;
    
    const term = searchTerm.toLowerCase();
    return cartazes.filter(cartaz =>
      cartaz.title.toLowerCase().includes(term)
    );
  }, [cartazes, searchTerm]);

  const hasResults = filteredCartazes.length > 0;
  const isSearching = searchTerm.trim().length > 0;

  return {
    searchTerm,
    setSearchTerm,
    filteredCartazes,
    hasResults,
    isSearching
  };
}
