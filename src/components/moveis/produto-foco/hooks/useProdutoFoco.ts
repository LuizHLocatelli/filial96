
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
    
    if (produto && typeof produto === 'object' && 'id' in produto) {
      const produtoId = produto.id;
      if (produtoId && imagens && imagens.length > 0) {
        await uploadMultipleImages(produtoId as string, imagens);
      }
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
