
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
    
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    return false;
  }
}
