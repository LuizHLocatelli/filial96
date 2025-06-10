
import { useGenericProdutoFocoCRUD } from '@/hooks/useGenericProdutoFocoCRUD';

export function useProdutoFocoCRUD() {
  return useGenericProdutoFocoCRUD('moveis_produto_foco');
}
