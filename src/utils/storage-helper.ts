
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifica se o bucket de armazenamento existe
 * Se não existir, notifica o usuário
 */
export async function ensureBucketExists(bucketName: string, isPublic = true) {
  try {
    // Primeiro verifica se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Erro ao listar buckets:", listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} não existe, não é possível criar automaticamente`);
      console.log("Verifique se o bucket foi criado manualmente no console do Supabase.");
      
      // Não é possível criar o bucket devido às políticas de segurança
      // Retornar falso para indicar que o bucket não está disponível
      return false;
    }
    
    console.log(`Bucket ${bucketName} encontrado e está disponível.`);
    return true;
  } catch (error) {
    console.error("Erro ao verificar se o bucket existe:", error);
    return false;
  }
}

/**
 * Get file extension from a file name or path
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Check if file is an image (PNG or JPEG)
 */
export function isImageFile(file: File): boolean {
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return validImageTypes.includes(file.type);
}

/**
 * Generate a unique file name for storage
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = getFileExtension(originalName);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${timestamp}_${randomString}.${ext}`;
}
