
import { useProdutoFocoData } from './useProdutoFocoData';
import { useProdutoFocoCRUD } from './useProdutoFocoCRUD';
import { useProdutoFocoImages } from './useProdutoFocoImages';
import { useProdutoFocoSales } from './useProdutoFocoSales';
import { ProdutoFoco } from '@/types/produto-foco';

export function useProdutoFoco() {
  const { produtos, produtoAtivo, isLoading, fetchProdutos, refetch } = useProdutoFocoData();
  const { createProduto, updateProduto, deleteProduto } = useProdutoFocoCRUD(refetch);
  const { uploadImagem, deleteImagem, uploadMultipleImages } = useProdutoFocoImages(refetch);
  const { registrarVenda, getVendasPorProduto } = useProdutoFocoSales();

  const createProdutoWithImages = async (
    dadosProduto: Omit<ProdutoFoco, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    imagens?: File[]
  ) => {
    const produto = await createProduto(dadosProduto);
    
    // Check if produto is valid and has an id before proceeding
    if (!produto || typeof produto !== 'object') {
      return produto;
    }
    
    // Type guard to ensure produto has id property
    if (!('id' in produto)) {
      return produto;
    }
    
    // At this point, TypeScript knows produto is non-null and has an id property
    const validProduto = produto as ProdutoFoco;
    const produtoId = validProduto.id;
    
    if (produtoId && imagens && imagens.length > 0) {
      await uploadMultipleImages(String(produtoId), imagens);
    }
    
    return validProduto;
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
