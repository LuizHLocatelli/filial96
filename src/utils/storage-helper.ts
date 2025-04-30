
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a storage bucket exists
 * Does not try to create it if it doesn't exist
 */
export async function checkBucketExists(bucketName: string) {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    return bucketExists || false;
  } catch (error) {
    console.error("Error checking if bucket exists:", error);
    return false;
  }
}

/**
 * Ensures that the specified storage bucket exists
 * If it doesn't exist, creates it with the provided options
 */
export async function ensureBucketExists(bucketName: string, isPublic = true) {
  try {
    // Check if bucket exists
    const bucketExists = await checkBucketExists(bucketName);
    
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} doesn't exist, trying to create it.`);
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully:`, data);
    } else {
      console.log(`Bucket ${bucketName} already exists.`);
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
