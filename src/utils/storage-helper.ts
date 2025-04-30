
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
      
      // For public buckets, we need to use the REST API to create the bucket due to RLS
      // This is because the client SDK might not have sufficient permissions
      try {
        const res = await fetch(`${supabase.supabaseUrl}/storage/v1/bucket`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify({
            id: bucketName,
            name: bucketName,
            public: isPublic,
            file_size_limit: 10485760 // 10MB
          })
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error(`Error creating bucket ${bucketName} via REST:`, errorData);
          return false;
        }
        
        console.log(`Bucket ${bucketName} created successfully via REST API`);
        return true;
      } catch (restError) {
        console.error(`REST API error creating bucket ${bucketName}:`, restError);
        return false;
      }
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
