
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Attachment, AttachmentUploadResult } from "@/types/attachments";

export async function fetchAttachments(taskId: string): Promise<Attachment[]> {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('task_id', taskId);
    
    if (error) {
      console.error("Error fetching attachments:", error);
      return [];
    }
    
    // Format the results
    return data.map(item => ({
      id: item.id,
      name: item.name,
      url: item.url,
      type: item.type,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return [];
  }
}

export async function uploadAttachmentToStorage(
  file: File, 
  taskId: string,
  userId: string
): Promise<AttachmentUploadResult> {
  try {
    // First verify user has access to the task
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('id, created_by, assigned_to')
      .eq('id', taskId)
      .single();
    
    if (taskError || !taskData) {
      return {
        success: false,
        error: new Error("Task not found or access denied")
      };
    }
    
    if (taskData.created_by !== userId && taskData.assigned_to !== userId) {
      return {
        success: false,
        error: new Error("Access denied: You don't have permission to add attachments to this task")
      };
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${taskId}/${fileName}`;
    
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('task_attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('task_attachments')
      .getPublicUrl(filePath);
    
    // Create attachment record in database
    const attachmentId = uuidv4();
    const attachmentData = {
      id: attachmentId,
      task_id: taskId,
      name: file.name,
      url: publicUrl,
      type: file.type,
      created_by: userId
    };
    
    const { error: dbError } = await supabase
      .from('attachments')
      .insert(attachmentData);
    
    if (dbError) throw dbError;
    
    // Return success with attachment data
    return {
      success: true,
      attachment: {
        id: attachmentId,
        name: file.name,
        url: publicUrl,
        type: file.type,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error during upload")
    };
  }
}

export async function deleteAttachmentFromStorage(
  attachmentId: string, 
  attachmentUrl: string
): Promise<boolean> {
  try {
    // Extract the path from the URL
    const urlParts = attachmentUrl.split('task_attachments/');
    if (urlParts.length < 2) return false;
    
    const storagePath = urlParts[1];
    
    // Delete the database record first (RLS will check ownership)
    const { error: dbError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);
    
    if (dbError) {
      console.error("Database deletion error:", dbError);
      return false;
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('task_attachments')
      .remove([storagePath]);
    
    if (storageError) {
      console.warn("Storage deletion warning:", storageError);
      // Don't fail the operation if storage deletion fails
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return false;
  }
}
