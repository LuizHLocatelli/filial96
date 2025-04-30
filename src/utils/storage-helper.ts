
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifica se o bucket de armazenamento existe e está configurado corretamente
 * Retorna um objeto com informações sobre o status do bucket
 */
export async function ensureBucketExists(bucketName: string): Promise<{
  exists: boolean;
  hasPermission: boolean;
  message: string;
}> {
  try {
    console.log(`Verificando existência do bucket '${bucketName}'...`);
    
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Erro ao listar buckets:", listError);
      return { 
        exists: false, 
        hasPermission: false, 
        message: `Erro ao verificar buckets: ${listError.message}` 
      };
    }
    
    const bucket = buckets?.find(bucket => bucket.name === bucketName);
    
    if (!bucket) {
      console.log(`Bucket '${bucketName}' não encontrado no projeto Supabase.`);
      return { 
        exists: false, 
        hasPermission: false, 
        message: `O bucket '${bucketName}' não foi encontrado. Crie-o no console do Supabase.` 
      };
    }

    // Tentar listar arquivos para verificar permissões
    const { data, error: listFilesError } = await supabase.storage
      .from(bucketName)
      .list();
      
    if (listFilesError && !listFilesError.message.includes("No such object")) {
      console.warn(`Problema ao acessar arquivos no bucket '${bucketName}':`, listFilesError);
      return { 
        exists: true, 
        hasPermission: false, 
        message: `Bucket encontrado, mas há problemas de permissão: ${listFilesError.message}` 
      };
    }
    
    console.log(`Bucket '${bucketName}' encontrado e permissões verificadas com sucesso.`);
    return { 
      exists: true, 
      hasPermission: true, 
      message: `Bucket '${bucketName}' está disponível e configurado corretamente.` 
    };
  } catch (error: any) {
    console.error("Erro ao verificar bucket:", error);
    return { 
      exists: false, 
      hasPermission: false, 
      message: `Erro ao verificar bucket: ${error.message || "Erro desconhecido"}` 
    };
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
