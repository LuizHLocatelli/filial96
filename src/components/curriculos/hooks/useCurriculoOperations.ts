import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Curriculo, JobPosition } from '@/types/curriculos';

interface UploadCurriculoData {
  candidate_name: string;
  job_position: JobPosition[];
  file: File;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export function useCurriculoOperations() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use PDF ou imagem (JPEG, PNG, WEBP)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB';
    }
    return null;
  }, []);

  const uploadCurriculo = useCallback(async (data: UploadCurriculoData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsUploading(true);

      // Validate file
      const validationError = validateFile(data.file);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Generate unique filename
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('curriculos')
        .upload(filePath, data.file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('curriculos')
        .getPublicUrl(filePath);

      // Determine file type
      const fileType = data.file.type === 'application/pdf' ? 'pdf' : 'image';

      // Save to database
      const { error: dbError } = await supabase
        .from('curriculos')
        .insert({
          candidate_name: data.candidate_name.trim(),
          job_position: data.job_position,
          file_url: publicUrl,
          file_type: fileType,
          file_size: data.file.size,
          created_by: user.id
        });

      if (dbError) {
        // Rollback: delete uploaded file
        await supabase.storage.from('curriculos').remove([filePath]);
        throw dbError;
      }

      return { success: true };
    } catch (err) {
      console.error('Error uploading curriculo:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao fazer upload do currículo' 
      };
    } finally {
      setIsUploading(false);
    }
  }, [validateFile]);

  const deleteCurriculo = useCallback(async (curriculo: Curriculo): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsDeleting(true);

      // Extract file path from URL
      const fileUrl = new URL(curriculo.file_url);
      const pathParts = fileUrl.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('curriculos') + 1).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('curriculos')
        .remove([filePath]);

      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Continue to delete from database even if storage delete fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('curriculos')
        .delete()
        .eq('id', curriculo.id);

      if (dbError) {
        throw dbError;
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting curriculo:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao excluir currículo' 
      };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    uploadCurriculo,
    deleteCurriculo,
    isUploading,
    isDeleting,
    validateFile
  };
}
