import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { indicatorOptions } from "@/components/crediario/types";
import { Listagem } from "@/hooks/crediario/useListagens";
import { ListagemItem } from "./ListagemItem";
import { useState } from "react";

interface ListagemListProps {
  listagens: Listagem[];
  isLoading: boolean;
  onView: (fileUrl: string, nome: string) => void;
  onDelete: (id: string, fileUrl: string) => void;
}

export function ListagemList({ listagens, isLoading, onView, onDelete }: ListagemListProps) {
  const [filterIndicator, setFilterIndicator] = useState<string | null>(null);
  
  const filteredListagens = filterIndicator 
    ? listagens.filter(item => item.indicator === filterIndicator)
    : listagens;
  
  return (
    <Card className="border shadow-soft">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Listagens Cadastradas</CardTitle>
            <CardDescription>
              Visualize e gerencie suas listagens de cobrança
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterIndicator || "all"} onValueChange={(value) => setFilterIndicator(value === "all" ? null : value)}>
              <SelectTrigger className="w-[180px] bg-muted/40">
                <SelectValue placeholder="Todos indicadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos indicadores</SelectItem>
                {indicatorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredListagens.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {filterIndicator 
                ? `Nenhuma listagem cadastrada para o indicador ${filterIndicator}`
                : "Nenhuma listagem cadastrada"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListagens.map((item) => (
              <ListagemItem 
                key={item.id} 
                item={item} 
                onView={onView} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
