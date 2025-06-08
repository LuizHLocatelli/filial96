import { useGenericProdutoFocoData } from '@/hooks/useGenericProdutoFocoData';

export function useProdutoFocoData() {
  return useGenericProdutoFocoData('moveis_produto_foco', 'moveis_produto_foco_imagens');
}
