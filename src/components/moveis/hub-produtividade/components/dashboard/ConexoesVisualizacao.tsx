import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Link2, 
  Calendar, 
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

interface ConexaoItem {
  id: string;
  nome: string;
  tipo: 'tarefa';
  status: string;
  relacionados: number;
  urgencia: 'baixa' | 'media' | 'alta';
}

export function ConexoesVisualizacao() {
  const [conexoes, setConexoes] = useState<ConexaoItem[]>([]);
  const [estatisticas, setEstatisticas] = useState({
    totalTarefas: 0,
    conexoesTotais: 0,
    produtividadeScore: 0
  });

  useEffect(() => {
    calcularConexoes();
  }, []);

  const calcularConexoes = () => {
    // Calcular estatísticas básicas
    const totalTarefas = 0;
    const conexoesTotais = 0;
    const produtividadeScore = 0;

    setEstatisticas({
      totalTarefas,
      conexoesTotais,
      produtividadeScore
    });

    // Criar lista de conexões para visualização (vazia agora)
    setConexoes([]);
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

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Tarefas</span>
              </div>
                              <div className="text-2xl font-bold text-emerald-600">
                {estatisticas.totalTarefas}
              </div>
              <p className="text-xs text-muted-foreground">
                Tarefas cadastradas
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
                Score de produtividade
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
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${getStatusColor(conexao.status)}`} />
                      <span className="font-medium text-sm">{conexao.nome}</span>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {conexao.relacionados} relacionado{conexao.relacionados !== 1 ? 's' : ''}
                    </Badge>
                    <Badge className={`text-xs ${getUrgenciaColor(conexao.urgencia)}`}>
                      {conexao.urgencia}
                    </Badge>
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
                O sistema de conexões foi simplificado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
