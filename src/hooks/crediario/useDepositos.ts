
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/crediario/useFileUpload';

export type Deposito = {
  id: string;
  data: string;
  concluido: boolean;
  ja_incluido: boolean;
  comprovante?: string;
  created_at: string;
  created_by?: string;
};

export function useDepositos() {
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { uploadFile, isUploading } = useFileUpload();

  useEffect(() => {
    fetchDepositos();
  }, []);

  const fetchDepositos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crediario_depositos')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
        throw error;
      }

      setDepositos(data);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar os depósitos',
        variant: 'destructive',
      });
      console.error('Erro ao buscar depósitos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addDeposito = async (depositoData: {
    data: Date;
    concluido?: boolean;
    ja_incluido?: boolean;
    comprovante?: File;
  }) => {
    try {
      let comprovante_url = '';
      
      // Upload do comprovante se existir
      if (depositoData.comprovante) {
        const result = await uploadFile(depositoData.comprovante, {
          bucketName: 'directory_files',
          folder: 'comprovantes',
          generateUniqueName: true
        });
        
        if (result) {
          comprovante_url = result.file_url;
        }
      }
      
      // Inserir depósito no banco
      const { data, error } = await supabase
        .from('crediario_depositos')
        .insert({
          data: depositoData.data.toISOString().split('T')[0],
          concluido: depositoData.concluido ?? true,
          ja_incluido: depositoData.ja_incluido ?? false,
          comprovante: comprovante_url || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Depósito adicionado com sucesso',
      });
      
      fetchDepositos();
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao adicionar depósito',
        variant: 'destructive',
      });
      console.error('Erro ao adicionar depósito:', error);
      return null;
    }
  };

  const updateDeposito = async (id: string, updates: Partial<Deposito>) => {
    try {
      const { error } = await supabase
        .from('crediario_depositos')
        .update(updates)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Depósito atualizado com sucesso',
      });
      
      fetchDepositos();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao atualizar depósito',
        variant: 'destructive',
      });
      console.error('Erro ao atualizar depósito:', error);
    }
  };

  const deleteDeposito = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crediario_depositos')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Depósito excluído com sucesso',
      });
      
      fetchDepositos();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao excluir depósito',
        variant: 'destructive',
      });
      console.error('Erro ao excluir depósito:', error);
    }
  };

  return {
    depositos,
    isLoading,
    isUploading,
    fetchDepositos,
    addDeposito,
    updateDeposito,
    deleteDeposito,
  };
}
