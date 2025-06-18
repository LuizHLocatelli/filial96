import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Link2, 
  CheckSquare, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Clock,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { RotinaWithStatus } from "../../../rotinas/types";
import { TarefaExpandida } from "../../../orientacoes/types";
import { motion } from "framer-motion";

interface ConexoesVisualizacaoProps {
  rotinas: RotinaWithStatus[];
  tarefas: TarefaExpandida[];
  onViewRotina?: (rotinaId: string) => void;
  onViewTarefa?: (tarefaId: string) => void;
}

interface ConexaoItem {
  id: string;
  nome: string;
  tipo: 'rotina' | 'tarefa';
  status: string;
  relacionados: number;
  urgencia: 'baixa' | 'media' | 'alta';
}

export function ConexoesVisualizacao({ 
  rotinas, 
  tarefas, 
  onViewRotina,
  onViewTarefa 
}: ConexoesVisualizacaoProps) {
  const [conexoes, setConexoes] = useState<ConexaoItem[]>([]);
  const [estatisticas, setEstatisticas] = useState({
    rotinasComTarefas: 0,
    tarefasDeRotinas: 0,
    conexoesTotais: 0,
    produtividadeScore: 0
  });

  useEffect(() => {
    calcularConexoes();
  }, [rotinas, tarefas]);

  const calcularConexoes = () => {
    // Contar rotinas que têm tarefas relacionadas
    const rotinasComTarefas = rotinas.filter(rotina => 
      tarefas.some(tarefa => tarefa.rotina_id === rotina.id)
    ).length;

    // Contar tarefas que vieram de rotinas
    const tarefasDeRotinas = tarefas.filter(tarefa => tarefa.rotina_id).length;

    // Calcular conexões totais
    const conexoesTotais = rotinasComTarefas + tarefasDeRotinas;

    // Calcular score de produtividade baseado nas conexões
    const totalItens = rotinas.length + tarefas.length;
    const produtividadeScore = totalItens > 0 ? Math.round((conexoesTotais / totalItens) * 100) : 0;

    setEstatisticas({
      rotinasComTarefas,
      tarefasDeRotinas,
      conexoesTotais,
      produtividadeScore
    });

    // Criar lista de conexões para visualização
    const conexoesList: ConexaoItem[] = [];

    // Adicionar rotinas com suas conexões
    rotinas.forEach(rotina => {
      const tarefasRelacionadas = tarefas.filter(t => t.rotina_id === rotina.id).length;
      if (tarefasRelacionadas > 0) {
        conexoesList.push({
          id: rotina.id,
          nome: rotina.nome,
          tipo: 'rotina',
          status: rotina.status || 'pendente',
          relacionados: tarefasRelacionadas,
          urgencia: tarefasRelacionadas > 3 ? 'alta' : tarefasRelacionadas > 1 ? 'media' : 'baixa'
        });
      }
    });

    // Limitar a 5 conexões principais para visualização
    setConexoes(conexoesList.slice(0, 5));
  };

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'text-green-600';
      case 'atrasada': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas de Conexões */}
              <div className="grid-responsive-stats">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Conexões</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {estatisticas.conexoesTotais}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de conexões ativas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Rotinas</span>
              </div>
                              <div className="text-2xl font-bold text-primary">
                {estatisticas.rotinasComTarefas}
              </div>
              <p className="text-xs text-muted-foreground">
                Com tarefas vinculadas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Tarefas</span>
              </div>
                              <div className="text-2xl font-bold text-emerald-600">
                {estatisticas.tarefasDeRotinas}
              </div>
              <p className="text-xs text-muted-foreground">
                Geradas por rotinas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Eficiência</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {estatisticas.produtividadeScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                Score de conexões
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Conexões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-green-600" />
            Mapa de Conexões Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conexoes.length > 0 ? (
            <div className="space-y-3">
              {conexoes.map((conexao, index) => (
                <motion.div
                  key={conexao.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    if (conexao.tipo === 'rotina') {
                      onViewRotina?.(conexao.id);
                    } else {
                      onViewTarefa?.(conexao.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {conexao.tipo === 'rotina' ? (
                        <CheckSquare className={`h-4 w-4 ${getStatusColor(conexao.status)}`} />
                      ) : (
                        <Calendar className={`h-4 w-4 ${getStatusColor(conexao.status)}`} />
                      )}
                      <span className="font-medium text-sm">{conexao.nome}</span>
                    </div>
                    
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {conexao.relacionados} relacionado{conexao.relacionados !== 1 ? 's' : ''}
                      </Badge>
                      <Badge className={`text-xs ${getUrgenciaColor(conexao.urgencia)}`}>
                        {conexao.urgencia}
                      </Badge>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              ))}
              
              {conexoes.length === 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Ver todas as conexões
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <h3 className="font-medium mb-1">Nenhuma conexão encontrada</h3>
              <p className="text-sm">
                Crie tarefas vinculadas às rotinas para visualizar as conexões
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendações de Melhoria */}
      {estatisticas.produtividadeScore < 70 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-800">
                  Oportunidades de Melhoria
                </h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  {estatisticas.rotinasComTarefas === 0 && (
                    <p>• Vincule tarefas às suas rotinas para melhor organização</p>
                  )}
                  {estatisticas.tarefasDeRotinas < tarefas.length / 2 && (
                    <p>• Configure templates automáticos nas rotinas recorrentes</p>
                  )}
                  <p>• Score atual: {estatisticas.produtividadeScore}% - Meta: 70%+</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 