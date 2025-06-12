import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetaCategoria } from "../../types/metasTypes";
import { Edit, Users } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface MetaCardProps {
  categoria: MetaCategoria;
  isManager: boolean;
  onEdit: (categoria: MetaCategoria) => void;
}

export function MetaCard({ categoria, isManager, onEdit }: MetaCardProps) {
  const IconComponent = categoria.icone ? 
    (Icons as any)[categoria.icone] || Icons.Target : 
    Icons.Target;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${categoria.cor}20` }}
            >
              <IconComponent 
                className="h-5 w-5"
                style={{ color: categoria.cor }}
              />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {categoria.nome}
              </CardTitle>
              {categoria.descricao && (
                <p className="text-sm text-muted-foreground mt-1">
                  {categoria.descricao}
                </p>
              )}
            </div>
          </div>
          {isManager && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(categoria)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Meta Mensal */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Meta Mensal</span>
            <span className="text-lg font-bold" style={{ color: categoria.cor }}>
              {formatCurrency(categoria.valor_meta_mensal)}
            </span>
          </div>

          {/* Funcionários com Metas */}
          {categoria.funcionarios_metas.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Funcionários</span>
                <Badge variant="secondary" className="text-xs">
                  {categoria.funcionarios_metas.length}
                </Badge>
              </div>
              
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {categoria.funcionarios_metas.map((funcionario, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between text-xs p-2 bg-background rounded border"
                  >
                    <span className="font-medium truncate">
                      {funcionario.funcionario_nome}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {formatCurrency(funcionario.valor_meta)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {categoria.funcionarios_metas.length === 0 && categoria.nome !== 'Geral' && (
            <div className="text-center text-sm text-muted-foreground py-2">
              Nenhuma meta individual definida
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
