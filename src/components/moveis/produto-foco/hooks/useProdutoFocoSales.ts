import { useGenericProdutoFocoSales } from '@/hooks/useGenericProdutoFocoSales';

export function useProdutoFocoSales() {
  return useGenericProdutoFocoSales('moveis_produto_foco_vendas');
}
