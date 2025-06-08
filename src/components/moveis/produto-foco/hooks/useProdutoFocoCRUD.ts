import { useGenericProdutoFocoCRUD } from '@/hooks/useGenericProdutoFocoCRUD';

export function useProdutoFocoCRUD(refetch: () => Promise<void>) {
  return useGenericProdutoFocoCRUD('moveis_produto_foco', refetch);
}
