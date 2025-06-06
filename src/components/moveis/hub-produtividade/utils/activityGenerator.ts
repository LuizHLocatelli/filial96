
import { ActivityItem, RotinaWithStatus, Orientacao, Tarefa } from '../types';

export function generateActivityTimeline(
  rotinas: RotinaWithStatus[],
  orientacoes: Orientacao[],
  tarefas: Tarefa[],
  getUserName: (userId: string) => string
): ActivityItem[] {
  const allActivities: ActivityItem[] = [];

  // Atividades de Rotinas com mais detalhes
  rotinas.forEach(rotina => {
    if (rotina.conclusao) {
      allActivities.push({
        id: `rotina-${rotina.id}`,
        type: 'rotina',
        title: rotina.nome,
        description: rotina.descricao || `Rotina concluída em ${new Date(rotina.conclusao.created_at).toLocaleDateString('pt-BR')}`,
        timestamp: rotina.conclusao.created_at,
        status: 'concluida',
        user: getUserName(rotina.created_by),
        action: 'concluida'
      });
    } else {
      // Verificar se está atrasada (mais de 1 dia sem conclusão)
      const now = new Date();
      const createdAt = new Date(rotina.created_at);
      const timeDiff = now.getTime() - createdAt.getTime();
      const isOverdue = timeDiff > 24 * 60 * 60 * 1000;
      
      allActivities.push({
        id: `rotina-${rotina.id}`,
        type: 'rotina',
        title: rotina.nome,
        description: rotina.descricao || `Rotina ${isOverdue ? 'pendente há mais de 24h' : 'aguardando conclusão'}`,
        timestamp: rotina.created_at,
        status: isOverdue ? 'atrasada' : rotina.status,
        user: getUserName(rotina.created_by),
        action: 'criada'
      });
    }
  });

  // Atividades de Orientações com informações de visualização
  orientacoes.slice(0, 15).forEach(orientacao => {
    const now = new Date();
    const createdAt = new Date(orientacao.data_criacao);
    const timeDiff = now.getTime() - createdAt.getTime();
    const isRecent = timeDiff < 48 * 60 * 60 * 1000; // 48h
    
    allActivities.push({
      id: `orientacao-${orientacao.id}`,
      type: 'orientacao',
      title: orientacao.titulo,
      description: orientacao.descricao || `${orientacao.tipo === 'vm' ? 'VM' : 'Orientação'} ${isRecent ? 'recém-publicada' : 'disponível'}`,
      timestamp: orientacao.data_criacao,
      status: isRecent ? 'nova' : 'pendente',
      user: orientacao.criado_por_nome || getUserName(orientacao.criado_por || ''),
      action: 'criada'
    });
  });

  // Atividades de Tarefas com análise de status mais precisa
  tarefas.slice(0, 15).forEach(tarefa => {
    const hoje = new Date();
    const dataEntrega = new Date(tarefa.data_entrega);
    const dataCriacao = new Date(tarefa.data_criacao);
    
    let status: 'concluida' | 'pendente' | 'atrasada' | 'nova';
    let action: 'criada' | 'concluida' | 'atualizada' | 'deletada' = 'criada';
    
    if (tarefa.status === 'concluida') {
      status = 'concluida';
      action = 'concluida';
    } else if (dataEntrega < hoje) {
      status = 'atrasada';
    } else if (dataEntrega.getTime() - hoje.getTime() < 24 * 60 * 60 * 1000) {
      status = 'pendente'; // Vence em menos de 24h
    } else {
      status = 'nova';
    }

    const diasParaVencimento = Math.ceil((dataEntrega.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000));
    let descricaoExtra = '';
    
    if (status === 'atrasada') {
      const diasAtraso = Math.abs(diasParaVencimento);
      descricaoExtra = ` - Atrasada há ${diasAtraso} dia${diasAtraso !== 1 ? 's' : ''}`;
    } else if (status === 'pendente') {
      descricaoExtra = ` - Vence ${diasParaVencimento === 0 ? 'hoje' : `em ${diasParaVencimento} dia${diasParaVencimento !== 1 ? 's' : ''}`}`;
    }

    allActivities.push({
      id: `tarefa-${tarefa.id}`,
      type: 'tarefa',
      title: tarefa.titulo,
      description: (tarefa.descricao || 'Sem descrição') + descricaoExtra,
      timestamp: action === 'concluida' ? tarefa.data_atualizacao || tarefa.data_criacao : tarefa.data_criacao,
      status,
      user: getUserName(tarefa.criado_por),
      action
    });
  });

  // Ordenar por timestamp (mais recente primeiro) e limitar
  return allActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 25); // Aumentado para 25 itens
}
