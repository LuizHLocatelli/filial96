
import { useProdutoFocoData } from './useProdutoFocoData';
import { useProdutoFocoCRUD } from './useProdutoFocoCRUD';
import { useProdutoFocoImages } from './useProdutoFocoImages';
import { useProdutoFocoSales } from './useProdutoFocoSales';
import { ProdutoFoco } from '@/types/produto-foco';

export function useProdutoFoco() {
  const { produtos, produtoAtivo, isLoading, fetchProdutos, refetch } = useProdutoFocoData();
  const { createProduto, updateProduto, deleteProduto } = useProdutoFocoCRUD('moda');
  const { uploadImagem, deleteImagem, uploadMultipleImages } = useProdutoFocoImages('moda');
  const { registrarVenda, getVendasPorProduto } = useProdutoFocoSales('moda');

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
