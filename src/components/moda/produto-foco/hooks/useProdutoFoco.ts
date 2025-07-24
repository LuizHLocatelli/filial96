
import { useProdutoFoco as useSharedProdutoFoco } from '@/hooks/useProdutoFoco';

/**
 * Custom hook for Moda Produto Foco that uses the shared implementation
 */
export function useProdutoFoco() {
  return useSharedProdutoFoco('moda');
}
