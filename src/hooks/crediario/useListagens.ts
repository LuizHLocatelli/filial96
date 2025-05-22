
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/crediario/useFileUpload';

export type Listagem = {
  id: string;
  nome: string;
  url: string;
  indicator?: string;
  created_at: string;
  created_by?: string;
};

export function useListagens() {
  const [listagens, setListagens] = useState<Listagem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { uploadFile, isUploading, progress } = useFileUpload();

  useEffect(() => {
    fetchListagens();
  }, []);

  const fetchListagens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crediario_listagens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setListagens(data);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar as listagens',
        variant: 'destructive',
      });
      console.error('Erro ao buscar listagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addListagem = async (file: File, indicator?: string | null) => {
    try {
      // Upload do arquivo
      const result = await uploadFile(file, {
        bucketName: 'directory_files',
        folder: 'listagens',
        generateUniqueName: true
      });
      
      if (!result) {
        throw new Error('Falha ao fazer upload do arquivo');
      }
      
      // Inserir listagem no banco
      const { data, error } = await supabase
        .from('crediario_listagens')
        .insert({
          nome: file.name,
          url: result.file_url,
          indicator: indicator || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Listagem adicionada com sucesso',
      });
      
      fetchListagens();
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao adicionar listagem',
        variant: 'destructive',
      });
      console.error('Erro ao adicionar listagem:', error);
      return null;
    }
  };

  const deleteListagem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crediario_listagens')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Listagem excluída com sucesso',
      });
      
      fetchListagens();
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao excluir listagem',
        variant: 'destructive',
      });
      console.error('Erro ao excluir listagem:', error);
      return false;
    }
  };

  return {
    listagens,
    isLoading,
    isUploading,
    progress,
    fetchListagens,
    addListagem,
    deleteListagem,
  };
}
