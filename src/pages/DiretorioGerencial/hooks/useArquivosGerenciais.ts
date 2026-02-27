import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { ArquivoGerencial } from "../types";
import { useToast } from "@/components/ui/use-toast";

export const useArquivosGerenciais = (pastaId?: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: arquivos, isLoading, error } = useQuery({
    queryKey: ['arquivos_gerenciais', pastaId],
    queryFn: async () => {
      let query = supabase
        .from('gerencial_arquivos')
        .select('*');

      if (pastaId === null) {
        query = query.is('pasta_id', null);
      } else if (pastaId) {
        query = query.eq('pasta_id', pastaId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        throw error;
      }
      
      return data as ArquivoGerencial[];
    },
    enabled: !!user,
  });

  const deleteArquivo = useMutation({
    mutationFn: async (arquivo: ArquivoGerencial) => {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('diretorio_gerencial')
        .remove([arquivo.caminho_storage]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        throw storageError;
      }

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('gerencial_arquivos')
        .delete()
        .eq('id', arquivo.id);

      if (dbError) {
        console.error('Error deleting from db:', dbError);
        throw dbError;
      }
      
      return arquivo.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arquivos_gerenciais'] });
      toast({
        title: "Sucesso",
        description: "Arquivo excluído com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const moverArquivo = useMutation({
    mutationFn: async ({ arquivoId, pastaId }: { arquivoId: string; pastaId: string | null }) => {
      const { data, error } = await supabase
        .from('gerencial_arquivos')
        .update({ pasta_id: pastaId })
        .eq('id', arquivoId)
        .select()
        .single();

      if (error) throw error;
      return data as ArquivoGerencial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arquivos_gerenciais'] });
      toast({
        title: "Sucesso",
        description: "Arquivo movido com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao mover",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const uploadFile = async (
    file: File, 
    pastaDestinoId: string | null,
    onProgress: (status: 'uploading' | 'analyzing' | 'completed' | 'error', progress: number) => void,
    customFileName?: string
  ) => {
    try {
      if (!user) throw new Error("Usuário não autenticado");

      onProgress('uploading', 10);
      
      // 1. Prepare file name and path
      const fileExt = file.name.split('.').pop();
      const storageFileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${storageFileName}`;
      
      // Use custom name if provided, otherwise use original name
      const displayName = customFileName ? `${customFileName}.${fileExt}` : file.name;
      
      onProgress('uploading', 30);

      // 2. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('diretorio_gerencial')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      onProgress('uploading', 80);

      // 3. Save to database
      const { data: dbData, error: dbError } = await supabase
        .from('gerencial_arquivos')
        .insert({
          nome_arquivo: displayName,
          caminho_storage: filePath,
          tipo_arquivo: file.type,
          tamanho_bytes: file.size,
          criado_por: user.id,
          pasta_id: pastaDestinoId
        })
        .select()
        .single();

      if (dbError) throw dbError;
      
      queryClient.invalidateQueries({ queryKey: ['arquivos_gerenciais'] });
      onProgress('analyzing', 90);

      // 4. Trigger AI summarization if it's a supported format (PDF or images)
      if (file.type.includes('pdf') || file.type.startsWith('image/')) {
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('gemini-document-analyzer', {
            body: {
              action: 'summarize',
              fileId: dbData.id
            }
          });
          
          if (!edgeError) {
             console.log("AI Analysis complete:", edgeData);
             queryClient.invalidateQueries({ queryKey: ['arquivos_gerenciais'] });
          } else {
             console.error("AI Analysis failed but file is saved:", edgeError);
          }
        } catch (aiError) {
          console.error("Error calling AI edge function:", aiError);
          // Don't fail the upload if AI fails
        }
      }

      onProgress('completed', 100);
      return dbData;

    } catch (error) {
      console.error("Upload error:", error);
      onProgress('error', 0);
      throw error;
    }
  };

  return {
    arquivos,
    isLoading,
    error,
    deleteArquivo,
    moverArquivo,
    uploadFile
  };
};
