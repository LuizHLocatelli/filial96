import { ProdutoFoco } from '@/types/produto-foco';
import { useGenericProdutoFocoCRUD } from './useGenericProdutoFocoCRUD';
import { useGenericProdutoFocoData } from './useGenericProdutoFocoData';
import { useGenericProdutoFocoImages } from './useGenericProdutoFocoImages';
import { useGenericProdutoFocoSales } from './useGenericProdutoFocoSales';

export type ModuleType = 'moda' | 'moveis';

/**
 * Unified hook for Produto Foco functionality that can be used by both Moda and Moveis modules
 */
export function useProdutoFoco(moduleType: ModuleType) {
  // Determine table names based on module
  const productTable = moduleType === 'moda' ? 'moda_produto_foco' : 'moveis_produto_foco';
  const imageTable = moduleType === 'moda' ? 'moda_produto_foco_imagens' : 'moveis_produto_foco_imagens';
  const storageBucket = moduleType === 'moda' ? 'moda-produto-foco' : 'moveis-produto-foco';
  const salesTable = moduleType === 'moda' ? 'moda_produto_foco_vendas' : 'moveis_produto_foco_vendas';

  // Initialize hooks with appropriate table names
  const { produtos, produtoAtivo, isLoading, fetchProdutos, refetch } = useGenericProdutoFocoData(productTable, imageTable);
  const { createProduto, updateProduto, deleteProduto } = useGenericProdutoFocoCRUD(productTable as any);
  const { uploadImagem, deleteImagem, uploadMultipleImages } = useGenericProdutoFocoImages(storageBucket, imageTable, refetch);
  const { registrarVenda, getVendasPorProduto } = useGenericProdutoFocoSales(salesTable);

  // Higher-level function to create product with optional images
  const createProdutoWithImages = async (
    dadosProduto: Omit<ProdutoFoco, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    imagens?: File[]
  ) => {
    const produto = await createProduto(dadosProduto);
    
    if (produto && produto.id) {
      if (imagens && imagens.length > 0) {
        await uploadMultipleImages(produto.id, imagens);
      }
      await refetch();
    }
    
    return produto;
  };

  return {
    produtos,
    produtoAtivo,
    isLoading,
    createProduto: createProdutoWithImages,
    updateProduto,
    deleteProduto,
    uploadImagem,
    deleteImagem,
    registrarVenda,
    getVendasPorProduto,
    refetch
  };
}