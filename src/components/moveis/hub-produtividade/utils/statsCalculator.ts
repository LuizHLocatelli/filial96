import { ProductivityStats } from '../types';

export function calculateProductivityStats(): ProductivityStats {
  // Produtividade score padrão
  const produtividadeScore = 0;

  return {
    produtividade: {
      score: produtividadeScore
    }
  };
}
