
import { useProdutoFoco as useSharedProdutoFoco } from '@/hooks/useProdutoFoco';

/**
 * Custom hook for Moveis Produto Foco that uses the shared implementation
 */
export function useProdutoFoco() {
  return useSharedProdutoFoco('moveis');
}
