
import { useState } from "react";
import { Search, Filter, Plus, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrientacaoCard } from "./components/OrientacaoCard";
import { OrientacaoViewerDialog } from "./OrientacaoViewerDialog";
import { Orientacao } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrientacoesListProps {
  orientacoes: Orientacao[];
  isLoading: boolean;
}

export function OrientacoesList({ orientacoes, isLoading }: OrientacoesListProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedOrientacao, setSelectedOrientacao] = useState<Orientacao | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const filteredOrientacoes = orientacoes.filter((orientacao) => {
    const matchesSearch = 
      orientacao.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orientacao.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || orientacao.tipo === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleViewOrientacao = (orientacao: Orientacao) => {
    setSelectedOrientacao(orientacao);
    setViewerOpen(true);
  };

  const typeStats = {
    all: orientacoes.length,
    vm: orientacoes.filter(o => o.tipo === "vm").length,
    informativo: orientacoes.filter(o => o.tipo === "informativo").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded-lg w-1/3" />
          <div className="flex gap-2">
            <div className="h-10 bg-muted animate-pulse rounded-lg flex-1" />
            <div className="h-10 bg-muted animate-pulse rounded-lg w-32" />
          </div>
        </div>
        
        {/* Cards Skeleton */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              Orientações
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-background/50">
                Total: {typeStats.all}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20">
                VM: {typeStats.vm}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20">
                Informativo: {typeStats.informativo}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Orientação
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar orientações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="vm">VM</SelectItem>
                <SelectItem value="informativo">Informativo</SelectItem>
              </SelectContent>
            </Select>

            {!isMobile && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredOrientacoes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            {searchQuery || filterType !== "all" ? "Nenhuma orientação encontrada" : "Nenhuma orientação ainda"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterType !== "all" 
              ? "Tente ajustar os filtros de busca"
              : "Comece criando sua primeira orientação"
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Orientação
          </Button>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === "grid" 
            ? (isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3')
            : 'grid-cols-1'
        }`}>
          {filteredOrientacoes.map((orientacao, index) => (
            <div
              key={orientacao.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <OrientacaoCard 
                orientacao={orientacao} 
                onView={handleViewOrientacao}
              />
            </div>
          ))}
        </div>
      )}

      {/* Viewer Dialog */}
      {selectedOrientacao && (
        <OrientacaoViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          orientacao={selectedOrientacao}
        />
      )}
    </div>
  );
}
