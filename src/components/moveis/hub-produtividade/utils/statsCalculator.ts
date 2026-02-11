import { ProductivityStats } from '../types';

export function calculateProductivityStats(): ProductivityStats {
  return {
    produtividade: { score: 0 },
    tarefas: { total: 0, concluidas: 0, pendentes: 0, atrasadas: 0 },
    rotinas: { total: 0, concluidas: 0, pendentes: 0 },
  };
}
