
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckSquare, 
  Clock,
  Calendar,
  ChevronRight,
  Link2,
  TrendingUp
} from "lucide-react";
import { TarefaExpandida } from "../types";
import { RotinaWithStatus } from "../../rotinas/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface TarefaRotinaConnectionProps {
  tarefa: TarefaExpandida;
  onViewRotina?: (rotinaId: string) => void;
}

export function TarefaRotinaConnection({ 
  tarefa, 
  onViewRotina 
}: TarefaRotinaConnectionProps) {
  const { toast } = useToast();
  const [rotinaRelacionada, setRotinaRelacionada] = useState<RotinaWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tarefa.rotina_id) {
      carregarRotinaRelacionada();
    } else {
      setIsLoading(false);
    }
  }, [tarefa.rotina_id]);

  const carregarRotinaRelacionada = async () => {
    if (!tarefa.rotina_id) return;

    try {
      setIsLoading(true);
      
      const { data: rotina, error } = await supabase
        .from('moveis_rotinas')
        .select('*')
        .eq('id', tarefa.rotina_id)
        .single();

      if (error) throw error;

      // Add status property to match RotinaWithStatus type
      setRotinaRelacionada({
        ...rotina,
        status: 'pendente' // Default status
      } as RotinaWithStatus);
    } catch (error) {
      console.error('Erro ao carregar rotina relacionada:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a rotina relacionada",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOrigemColor = (origem: string) => {
    switch (origem) {
      case 'rotina': return 'bg-green-100 text-green-800 border-green-200';
      case 'orientacao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manual': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPeriodicidadeText = (periodicidade: string) => {
    switch (periodicidade) {
      case 'diario': return 'Diária';
      case 'semanal': return 'Semanal';
      case 'mensal': return 'Mensal';
      case 'personalizado': return 'Personalizada';
      default: return periodicidade;
    }
  };

  const getStatusRotinaColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'text-green-600';
      case 'pendente': return 'text-yellow-600';
      case 'atrasada': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Se não há rotina relacionada, não mostra o componente
  if (!tarefa.rotina_id || (!isLoading && !rotinaRelacionada)) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Tarefa conectada à rotina
            </span>
            <Badge className={getOrigemColor(tarefa.origem)}>
              {tarefa.origem}
            </Badge>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse" />
              <div className="h-3 bg-muted/30 rounded animate-pulse w-3/4" />
            </div>
          ) : rotinaRelacionada ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {/* Informações da rotina */}
              <div 
                className="p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewRotina?.(rotinaRelacionada.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      <h4 className="text-sm font-medium">{rotinaRelacionada.nome}</h4>
                      {rotinaRelacionada.status && (
                        <div className={`text-xs font-medium ${getStatusRotinaColor(rotinaRelacionada.status)}`}>
                          ({rotinaRelacionada.status})
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{getPeriodicidadeText(rotinaRelacionada.periodicidade)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{rotinaRelacionada.categoria}</span>
                      </div>
                    </div>

                    {rotinaRelacionada.descricao && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {rotinaRelacionada.descricao}
                      </p>
                    )}
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewRotina?.(rotinaRelacionada.id)}
                  className="gap-2 text-xs"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Ver Rotina
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Rotina relacionada não encontrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
