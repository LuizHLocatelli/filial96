import { useGenericProdutoFocoImages } from '@/hooks/useGenericProdutoFocoImages';

export function useProdutoFocoImages(refetch: () => Promise<void>) {
  return useGenericProdutoFocoImages('moveis-produto-foco', 'moveis_produto_foco_imagens', refetch);
}
