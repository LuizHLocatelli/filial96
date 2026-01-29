
import { ProductivityStats, RotinaWithStatus, Orientacao, Tarefa } from '../types';

export function calculateProductivityStats(
  rotinas: RotinaWithStatus[],
  orientacoes: Orientacao[],
  tarefas: Tarefa[]
): ProductivityStats {
  // Rotinas stats
  const rotinasStats = {
    total: rotinas.length,
    concluidas: rotinas.filter(r => r.status === 'concluida').length,
    pendentes: rotinas.filter(r => r.status === 'pendente').length,
    atrasadas: rotinas.filter(r => r.status === 'atrasada').length,
    percentualConclusao: rotinas.length > 0 ? 
      Math.round((rotinas.filter(r => r.status === 'concluida').length / rotinas.length) * 100) : 0
  };

  // Orientações stats
  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000));
  const orientacoesRecentes = orientacoes.filter(o => 
    new Date(o.data_criacao) >= trintaDiasAtras
  );

  const orientacoesStats = {
    total: orientacoes.length,
    lidas: 0, // TODO: Implementar lógica de leitura
    naoLidas: orientacoes.length,
    recentes: orientacoesRecentes.length
  };

  // Tarefas stats
  const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida');
  const tarefasPendentes = tarefas.filter(t => t.status === 'pendente');
  const tarefasAtrasadas = tarefas.filter(t => {
    const dataEntrega = new Date(t.data_entrega);
    return dataEntrega < hoje && t.status !== 'concluida';
  });

  const tarefasStats = {
    total: tarefas.length,
    concluidas: tarefasConcluidas.length,
    pendentes: tarefasPendentes.length,
    atrasadas: tarefasAtrasadas.length,
    percentualConclusao: tarefas.length > 0 ? 
      Math.round((tarefasConcluidas.length / tarefas.length) * 100) : 0
  };

  // Produtividade score
  const totalItens = rotinasStats.total + tarefasStats.total;
  const itensConcluidos = rotinasStats.concluidas + tarefasStats.concluidas;
  const produtividadeScore = totalItens > 0 ? Math.round((itensConcluidos / totalItens) * 100) : 0;

  return {
    rotinas: rotinasStats,
    orientacoes: orientacoesStats,
    tarefas: tarefasStats,
    produtividade: {
      score: produtividadeScore
    }
  };
}
