
import { RotinaWithStatus, Tarefa } from '../types';

export function calculateRotinaStatus(
  rotina: any,
  conclusoes: any[]
): 'pendente' | 'concluida' | 'atrasada' {
  const hoje = new Date();
  const conclusoesRotina = conclusoes.filter(c => c.rotina_id === rotina.id);
  
  const conclusaoMaisRecente = conclusoesRotina
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  if (!conclusaoMaisRecente) {
    return 'atrasada';
  }

  const dataConclusao = new Date(conclusaoMaisRecente.data_conclusao);
  const diffDays = Math.floor((hoje.getTime() - dataConclusao.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (rotina.periodicidade) {
    case 'diario':
      return diffDays === 0 ? 'concluida' : (diffDays > 1 ? 'atrasada' : 'pendente');
    case 'semanal':
      return diffDays < 7 ? 'concluida' : 'atrasada';
    case 'mensal':
      return diffDays < 30 ? 'concluida' : 'atrasada';
    default:
      return diffDays > 1 ? 'atrasada' : 'pendente';
  }
}

export function calculateTarefaStatus(tarefa: Tarefa): 'pendente' | 'concluida' | 'atrasada' {
  if (tarefa.status === 'concluida') {
    return 'concluida';
  }
  
  const hoje = new Date();
  const dataEntrega = new Date(tarefa.data_entrega);
  
  return dataEntrega < hoje ? 'atrasada' : 'pendente';
}
