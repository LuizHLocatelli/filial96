
import { useState, useMemo } from "react";
import { CartazItem } from "./useCartazes";

export function useCartazSearch(cartazes: CartazItem[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("");

  const filteredCartazes = useMemo(() => {
    let result = cartazes;
    
    if (monthFilter) {
      result = result.filter(cartaz => cartaz.month === monthFilter);
    }
    
    if (!searchTerm.trim()) return result;
    
    const term = searchTerm.toLowerCase();
    return result.filter(cartaz =>
      cartaz.title.toLowerCase().includes(term)
    );
  }, [cartazes, searchTerm, monthFilter]);

  const hasResults = filteredCartazes.length > 0;
  const isSearching = searchTerm.trim().length > 0 || monthFilter.length > 0;

  return {
    searchTerm,
    setSearchTerm,
    monthFilter,
    setMonthFilter,
    filteredCartazes,
    hasResults,
    isSearching
  };
}
