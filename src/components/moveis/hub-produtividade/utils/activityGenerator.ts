
import { ActivityItem, RotinaWithStatus, Orientacao, Tarefa } from '../types';

export function generateActivityTimeline(
  rotinas: RotinaWithStatus[],
  orientacoes: Orientacao[],
  tarefas: Tarefa[],
  getUserName: (userId: string) => string
): ActivityItem[] {
  const allActivities: ActivityItem[] = [];

  // Atividades de Rotinas
  rotinas.forEach(rotina => {
    if (rotina.conclusao) {
      allActivities.push({
        id: `rotina-${rotina.id}`,
        type: 'rotina',
        title: rotina.nome,
        description: rotina.descricao,
        timestamp: rotina.conclusao.created_at,
        status: 'concluida',
        user: getUserName(rotina.created_by),
        action: 'concluida'
      });
    } else {
      allActivities.push({
        id: `rotina-${rotina.id}`,
        type: 'rotina',
        title: rotina.nome,
        description: rotina.descricao,
        timestamp: rotina.created_at,
        status: rotina.status,
        user: getUserName(rotina.created_by),
        action: 'criada'
      });
    }
  });

  // Atividades de Orientações (limitadas para performance)
  orientacoes.slice(0, 10).forEach(orientacao => {
    allActivities.push({
      id: `orientacao-${orientacao.id}`,
      type: 'orientacao',
      title: orientacao.titulo,
      description: orientacao.descricao,
      timestamp: orientacao.data_criacao,
      status: 'nova',
      user: orientacao.criado_por_nome || getUserName(orientacao.criado_por || ''),
      action: 'criada'
    });
  });

  // Atividades de Tarefas (limitadas para performance)
  tarefas.slice(0, 10).forEach(tarefa => {
    const hoje = new Date();
    const dataEntrega = new Date(tarefa.data_entrega);
    const status = tarefa.status === 'concluida' ? 'concluida' :
                  dataEntrega < hoje ? 'atrasada' : 'pendente';

    allActivities.push({
      id: `tarefa-${tarefa.id}`,
      type: 'tarefa',
      title: tarefa.titulo,
      description: tarefa.descricao,
      timestamp: tarefa.data_criacao,
      status,
      user: getUserName(tarefa.criado_por),
      action: tarefa.status === 'concluida' ? 'concluida' : 'criada'
    });
  });

  // Ordenar por timestamp (mais recente primeiro) e limitar
  return allActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}
