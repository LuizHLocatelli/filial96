import { useGenericProdutoFocoCRUD } from '@/hooks/useGenericProdutoFocoCRUD';

export function useProdutoFocoCRUD(refetch: () => Promise<void>) {
  return useGenericProdutoFocoCRUD('moda_produto_foco', refetch);
} 