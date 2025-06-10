
import { ProductivityStats } from '../types';

export interface StatsData {
  totalRotinas: number;
  rotinasConcluidas: number;
  rotinasPendentes: number;
  rotinasAtrasadas: number;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasPendentes: number;
  tarefasAtrasadas: number;
  progressoGeral: number;
}

export function adaptProductivityStatsToStatsData(stats: ProductivityStats): StatsData {
  return {
    totalRotinas: stats.rotinas?.total || 0,
    rotinasConcluidas: stats.rotinas?.concluidas || 0,
    rotinasPendentes: stats.rotinas?.pendentes || 0,
    rotinasAtrasadas: stats.rotinas?.atrasadas || 0,
    totalTarefas: stats.tarefas?.total || 0,
    tarefasConcluidas: stats.tarefas?.concluidas || 0,
    tarefasPendentes: stats.tarefas?.pendentes || 0,
    tarefasAtrasadas: stats.tarefas?.atrasadas || 0,
    progressoGeral: stats.produtividade?.score || 0,
  };
}
