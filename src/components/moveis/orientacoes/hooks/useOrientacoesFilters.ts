
import { useState, useMemo } from "react";
import { Orientacao } from "../types";

export function useOrientacoesFilters(orientacoes: Orientacao[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredOrientacoes = useMemo(() => {
    return orientacoes.filter((orientacao) => {
      const matchesSearch = 
        orientacao.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orientacao.descricao.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === "all" || orientacao.tipo === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [orientacoes, searchQuery, filterType]);

  const typeStats = useMemo(() => ({
    all: orientacoes.length,
    vm: orientacoes.filter(o => o.tipo === "vm").length,
    informativo: orientacoes.filter(o => o.tipo === "informativo").length,
  }), [orientacoes]);

  return {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    viewMode,
    setViewMode,
    filteredOrientacoes,
    typeStats,
    hasFilters: searchQuery !== "" || filterType !== "all"
  };
}
