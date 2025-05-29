import { useState } from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface OrientacoesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function OrientacoesFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: OrientacoesFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col gap-4"
    >
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar orientações..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 h-12 bg-gradient-to-r from-background to-muted/20 border-border/40 hover:border-border/60 focus:border-primary/50 transition-all duration-300 shadow-sm"
        />
      </div>
      
      {/* Filters and View Mode */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Select value={filterType} onValueChange={onFilterChange}>
            <SelectTrigger className={`${isMobile ? 'flex-1' : 'w-[200px]'} bg-gradient-to-r from-background to-muted/20 border-border/40 hover:border-border/60 transition-all duration-300 shadow-sm h-10`}>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="vm">VM</SelectItem>
              <SelectItem value="informativo">Informativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isMobile && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center gap-1 bg-gradient-to-r from-muted/40 to-muted/20 rounded-lg p-1 border border-border/40 shadow-sm"
          >
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={`h-8 w-8 p-0 transition-all duration-300 ${
                viewMode === "grid" 
                  ? "bg-gradient-to-r from-primary to-primary/90 shadow-sm" 
                  : "hover:bg-muted/60"
              }`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={`h-8 w-8 p-0 transition-all duration-300 ${
                viewMode === "list" 
                  ? "bg-gradient-to-r from-primary to-primary/90 shadow-sm" 
                  : "hover:bg-muted/60"
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
