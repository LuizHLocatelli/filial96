import { useGenericProdutoFocoImages } from '@/hooks/useGenericProdutoFocoImages';

export function useProdutoFocoImages(refetch: () => Promise<void>) {
  return useGenericProdutoFocoImages('moda-produto-foco', 'moda_produto_foco_imagens', refetch);
} 