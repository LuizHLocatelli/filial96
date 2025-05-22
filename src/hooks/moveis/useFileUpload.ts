
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadOptions } from '@/types/attachments';
import { toast } from '@/hooks/use-toast';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);

  // Função para upload de arquivos genéricos
  const uploadFile = async (file: File, options: FileUploadOptions) => {
    try {
      setIsUploading(true);
      
      // Validações básicas
      if (!file) {
        toast({
          title: "Erro",
          description: "Nenhum arquivo selecionado",
          variant: "destructive",
        });
        return null;
      }
      
      // Verificar tamanho máximo (padrão: 5MB)
      const maxSizeInMB = options.maxSizeInMB || 5;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast({
          title: "Erro",
          description: `O arquivo excede o tamanho máximo de ${maxSizeInMB}MB`,
          variant: "destructive",
        });
        return null;
      }

      // Gerar caminho do arquivo
      let filePath = options.folder ? `${options.folder}/` : '';
      
      // Gerar nome único para o arquivo se solicitado
      if (options.generateUniqueName) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        filePath += fileName;
      } else {
        filePath += file.name;
      }

      // Realizar upload do arquivo
      const { data, error } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error("Erro ao fazer upload:", error);
        toast({
          title: "Erro no upload",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(data.path);

      // Retornar dados formatados para uso na aplicação
      return {
        name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: Math.round(file.size / 1024), // Tamanho em KB
      };
    } catch (err) {
      console.error("Erro inesperado no upload:", err);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao fazer o upload do arquivo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadFile
  };
}
