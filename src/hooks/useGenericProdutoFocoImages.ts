
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export function useGenericProdutoFocoImages(
  storageBucket: string, 
  tableName: string, 
  refetch: () => Promise<void>
) {
  const { user } = useAuth();

  const uploadImagem = async (produtoId: string, file: File, ordem: number = 0) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${produtoId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(storageBucket)
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from(tableName as any)
        .insert({
          produto_foco_id: produtoId,
          imagem_url: publicUrl,
          imagem_nome: file.name,
          imagem_tipo: file.type,
          imagem_tamanho: file.size,
          ordem,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await refetch();
      return data;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    }
  };

  const deleteImagem = async (imagemId: string, imagemUrl: string) => {
    try {
      // Extrair o path da URL
      const urlParts = imagemUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // produtoId/arquivo.ext

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from(storageBucket)
        .remove([fileName]);

      if (storageError) throw storageError;

      // Deletar do banco
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', imagemId);

      if (error) throw error;

      toast.success('Imagem excluída com sucesso!');
      await refetch();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      toast.error('Erro ao excluir imagem');
    }
  };

  const uploadMultipleImages = async (produtoId: string, images: File[]) => {
    if (!images || images.length === 0) return [];

    const uploadPromises = images.map((image, index) => 
      uploadImagem(produtoId, image, index)
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results.filter(result => result !== null);
    } catch (error) {
      console.error('Erro ao fazer upload de múltiplas imagens:', error);
      toast.error('Erro ao fazer upload de algumas imagens');
      return [];
    }
  };

  return {
    uploadImagem,
    deleteImagem,
    uploadMultipleImages
  };
}
