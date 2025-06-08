import { useGenericProdutoFocoData } from '@/hooks/useGenericProdutoFocoData';

export function useProdutoFocoData() {
  return useGenericProdutoFocoData('moda_produto_foco', 'moda_produto_foco_imagens');
} 