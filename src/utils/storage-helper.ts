
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that the specified storage bucket exists
 * If it doesn't exist, creates it with the provided options
 */
export async function ensureBucketExists(bucketName: string, isPublic = true) {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} doesn't exist, attempting to create it...`);
      
      // Create the bucket directly using the storage API
      const { data: bucketData, error: createError } = await supabase.storage.createBucket(
        bucketName,
        {
          public: isPublic,
          fileSizeLimit: 10485760 // 10MB
        }
      );
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
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
