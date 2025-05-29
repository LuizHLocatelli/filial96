
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for security validation and access control
 */

export interface AccessValidationResult {
  hasAccess: boolean;
  error?: string;
}

/**
 * Validates if the current user has access to a specific task
 */
export async function validateTaskAccess(taskId: string): Promise<AccessValidationResult> {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      return { hasAccess: false, error: "User not authenticated" };
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .select('created_by, assigned_to')
      .eq('id', taskId)
      .single();

    if (error) {
      return { hasAccess: false, error: "Task not found" };
    }

    const userId = currentUser.user.id;
    const hasAccess = task.created_by === userId || task.assigned_to === userId;

    return { 
      hasAccess, 
      error: hasAccess ? undefined : "Access denied: You don't have permission to access this task" 
    };
  } catch (error) {
    console.error("Error validating task access:", error);
    return { hasAccess: false, error: "Failed to validate access" };
  }
}

/**
 * Validates if the current user can modify a specific task
 */
export async function validateTaskOwnership(taskId: string): Promise<AccessValidationResult> {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      return { hasAccess: false, error: "User not authenticated" };
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .select('created_by')
      .eq('id', taskId)
      .single();

    if (error) {
      return { hasAccess: false, error: "Task not found" };
    }

    const userId = currentUser.user.id;
    const hasAccess = task.created_by === userId;

    return { 
      hasAccess, 
      error: hasAccess ? undefined : "Access denied: You don't own this task" 
    };
  } catch (error) {
    console.error("Error validating task ownership:", error);
    return { hasAccess: false, error: "Failed to validate ownership" };
  }
}

/**
 * Validates if the current user can modify an attachment
 */
export async function validateAttachmentOwnership(attachmentId: string): Promise<AccessValidationResult> {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      return { hasAccess: false, error: "User not authenticated" };
    }

    const { data: attachment, error } = await supabase
      .from('attachments')
      .select('created_by')
      .eq('id', attachmentId)
      .single();

    if (error) {
      return { hasAccess: false, error: "Attachment not found" };
    }

    const userId = currentUser.user.id;
    const hasAccess = attachment.created_by === userId;

    return { 
      hasAccess, 
      error: hasAccess ? undefined : "Access denied: You don't own this attachment" 
    };
  } catch (error) {
    console.error("Error validating attachment ownership:", error);
    return { hasAccess: false, error: "Failed to validate ownership" };
  }
}

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates file types for uploads
 */
export function validateFileType(fileName: string, allowedTypes: string[]): boolean {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  if (!fileExtension) return false;
  
  return allowedTypes.includes(fileExtension);
}

/**
 * Common allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
  ARCHIVES: ['zip', 'rar', '7z'],
  ALL_COMMON: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt', 'zip', 'rar', '7z']
};
