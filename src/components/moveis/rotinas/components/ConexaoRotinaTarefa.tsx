
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Link2, 
  Plus, 
  CheckSquare, 
  Calendar, 
  ChevronRight,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { RotinaWithStatus } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConexaoRotinaTarefaProps {
  rotina: RotinaWithStatus;
  onCreateTarefa?: (rotinaId: string) => void;
  onViewTarefa?: (tarefaId: string) => void;
}

interface TarefaRelacionada {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  data_entrega: string;
  criado_por: string;
  data_criacao: string;
  data_atualizacao: string;
  orientacao_id: string | null;
  moveis_orientacoes: { titulo: string } | null;
}

export function ConexaoRotinaTarefa({ 
  rotina, 
  onCreateTarefa,
  onViewTarefa 
}: ConexaoRotinaTarefaProps) {
  const { toast } = useToast();
  const [tarefasRelacionadas, setTarefasRelacionadas] = useState<TarefaRelacionada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTarefa, setIsCreatingTarefa] = useState(false);

  useEffect(() => {
    carregarTarefasRelacionadas();
  }, [rotina.id]);

  const carregarTarefasRelacionadas = async () => {
    try {
      setIsLoading(true);
      
      // Query tarefas without rotina_id since the table doesn't have this column
      const { data: tarefas, error } = await supabase
        .from('moveis_tarefas')
        .select(`
          id,
          titulo,
          descricao,
          status,
          data_entrega,
          criado_por,
          data_criacao,
          data_atualizacao,
          orientacao_id,
          moveis_orientacoes (titulo)
        `)
        .order('data_entrega', { ascending: true });

      if (error) throw error;

      setTarefasRelacionadas(tarefas || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas relacionadas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas relacionadas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const criarTarefaAutomatica = async () => {
    try {
      setIsCreatingTarefa(true);
      
      const dataEntrega = new Date();
      dataEntrega.setDate(dataEntrega.getDate() + 3);

      const novaTarefa = {
        titulo: `Tarefa: ${rotina.nome}`,
        descricao: `Tarefa gerada automaticamente pela rotina: ${rotina.nome}`,
        data_entrega: dataEntrega.toISOString(),
        status: 'pendente',
        criado_por: rotina.created_by
      };

      const { error } = await supabase
        .from('moveis_tarefas')
        .insert(novaTarefa);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa criada automaticamente a partir da rotina",
      });

      carregarTarefasRelacionadas();
      
    } catch (error) {
      console.error('Erro ao criar tarefa automática:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa automática",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTarefa(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atrasada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-green-600" />
          Conexão Rotina ↔ Tarefas
          {tarefasRelacionadas.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {tarefasRelacionadas.length} tarefa{tarefasRelacionadas.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estatísticas rápidas */}
        {tarefasRelacionadas.length > 0 && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium text-green-600">
                {tarefasRelacionadas.filter(t => t.status === 'concluida').length}
              </div>
              <div className="text-xs text-muted-foreground">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-yellow-600">
                {tarefasRelacionadas.filter(t => t.status === 'pendente').length}
              </div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-red-600">
                {tarefasRelacionadas.filter(t => t.status === 'atrasada').length}
              </div>
              <div className="text-xs text-muted-foreground">Atrasadas</div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={criarTarefaAutomatica}
            disabled={isCreatingTarefa}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isCreatingTarefa ? 'Criando...' : 'Gerar Tarefa'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateTarefa?.(rotina.id)}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Nova Tarefa Manual
          </Button>
        </div>

        {/* Lista de tarefas relacionadas */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tarefasRelacionadas.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Tarefas Relacionadas
            </h4>
            
            {tarefasRelacionadas.map((tarefa) => (
              <div
                key={tarefa.id}
                className="p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onViewTarefa?.(tarefa.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium">{tarefa.titulo}</h5>
                      <div className={`w-2 h-2 rounded-full ${getPrioridadeColor('media')}`} />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        rotina
                      </Badge>
                      <span>Entrega: {new Date(tarefa.data_entrega).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(tarefa.status)}>
                      {tarefa.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma tarefa relacionada</p>
            <p className="text-xs">Crie tarefas para organizar o trabalho desta rotina</p>
          </div>
        )}

        {/* Indicador de progresso */}
        {tarefasRelacionadas.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso das Tarefas</span>
              <span>
                {tarefasRelacionadas.filter(t => t.status === 'concluida').length} / {tarefasRelacionadas.length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${tarefasRelacionadas.length > 0 
                    ? (tarefasRelacionadas.filter(t => t.status === 'concluida').length / tarefasRelacionadas.length) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
