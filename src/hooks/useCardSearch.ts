
import { useState, useMemo } from "react";
import { CardItem } from "./useCardOperations";

export function useCardSearch(cards: CardItem[]) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) {
      return cards;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    
    return cards.filter(card => {
      const titleMatch = card.title.toLowerCase().includes(searchLower);
      const codeMatch = card.code?.toLowerCase().includes(searchLower) || false;
      
      return titleMatch || codeMatch;
    });
  }, [cards, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredCards,
    hasResults: filteredCards.length > 0,
    isSearching: searchTerm.trim().length > 0
  };
}
