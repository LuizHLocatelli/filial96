
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetaFoco } from "../../types/metasTypes";
import { Calendar, Target, X } from "lucide-react";
import * as Icons from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetaFocoCardProps {
  metaFoco: MetaFoco;
  isManager: boolean;
  onRemove: (metaFocoId: string) => void;
}

export function MetaFocoCard({ metaFoco, isManager, onRemove }: MetaFocoCardProps) {
  const IconComponent = metaFoco.categoria_icone ? 
    (Icons as any)[metaFoco.categoria_icone] || Icons.Target : 
    Icons.Target;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const dataFormatada = format(new Date(metaFoco.data_foco), "dd 'de' MMMM", { locale: ptBR });

  return (
    <Card className="border-2 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg bg-white/50"
              style={{ borderColor: metaFoco.categoria_cor }}
            >
              <IconComponent 
                className="h-5 w-5"
                style={{ color: metaFoco.categoria_cor }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Badge 
                  className="text-xs"
                  style={{ 
                    backgroundColor: metaFoco.categoria_cor + '20',
                    color: metaFoco.categoria_cor,
                    borderColor: metaFoco.categoria_cor + '50'
                  }}
                >
                  Meta Foco Hoje
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold mt-1">
                {metaFoco.titulo}
              </CardTitle>
            </div>
          </div>
          {isManager && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(metaFoco.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Informações da Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Data</span>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {dataFormatada}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Valor</span>
              </div>
              <p className="text-lg font-bold" style={{ color: metaFoco.categoria_cor }}>
                {formatCurrency(metaFoco.valor_meta)}
              </p>
            </div>
          </div>

          {/* Categoria */}
          <div className="p-3 bg-white/50 rounded-lg border">
            <span className="text-sm font-medium">Categoria: </span>
            <span className="text-sm" style={{ color: metaFoco.categoria_cor }}>
              {metaFoco.categoria_nome}
            </span>
          </div>

          {/* Descrição */}
          {metaFoco.descricao && (
            <div className="space-y-1">
              <span className="text-sm font-medium">Descrição</span>
              <p className="text-sm text-muted-foreground">
                {metaFoco.descricao}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
