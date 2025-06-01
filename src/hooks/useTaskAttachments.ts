import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Attachment } from "@/types/attachments";
import { useAuth } from "@/contexts/auth";
import { 
  fetchAttachments,
  uploadAttachmentToStorage,
  deleteAttachmentFromStorage
} from "./attachments/useAttachmentDatabase";
import { useAttachmentUploadState } from "./attachments/useAttachmentUploadState";

export function useTaskAttachments(taskId?: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { isUploading, progress, startUpload, updateProgress, finishUpload } = useAttachmentUploadState();
  const { toast } = useToast();
  const { user } = useAuth();

  const loadAttachments = useCallback(async (currentTaskId: string) => {
    if (!currentTaskId) return;
    
    try {
      const loadedAttachments = await fetchAttachments(currentTaskId);
      setAttachments(loadedAttachments);
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
      setError("Erro ao carregar anexos");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Reload attachments when taskId changes
  useEffect(() => {
    if (taskId) {
      loadAttachments(taskId);
    }
  }, [taskId, loadAttachments]);
  
  const uploadAttachment = async (file: File, currentTaskId?: string) => {
    if (!currentTaskId && !taskId) {
      toast({
        title: "Erro ao fazer upload",
        description: "É necessário salvar a tarefa antes de anexar arquivos",
        variant: "destructive",
      });
      return null;
    }
    
    const effectiveTaskId = currentTaskId || taskId;
    if (!effectiveTaskId) return null;
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para fazer upload de arquivos",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: "Apenas imagens (JPEG, PNG, WebP) e PDFs são permitidos",
          variant: "destructive",
        });
        return null;
      }
      
      // Validate file size (5MB maximum)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB",
          variant: "destructive",
        });
        return null;
      }
      
      // Start upload process
      startUpload();
      
      // Progress simulation
      updateProgress(30);
      
      // Perform upload
      const result = await uploadAttachmentToStorage(file, effectiveTaskId, user.id);
      
      // Update progress
      updateProgress(80);
      
      if (!result.success) {
        throw result.error;
      }
      
      // Add new attachment to state
      if (result.attachment) {
        setAttachments(prev => [...prev, result.attachment!]);
      }
      
      // Complete upload
      finishUpload(true);
      
      toast({
        title: "Upload concluído",
        description: `${file.name} foi anexado à tarefa`
      });
      
      return result.attachment;
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível fazer upload do arquivo.",
      });
      finishUpload(false);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const deleteAttachment = async (attachmentId: string) => {
    try {
      // Find the attachment to get URL
      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return false;
      
      // Delete the attachment from storage and database
      const success = await deleteAttachmentFromStorage(attachmentId, attachment.url);
      
      if (success) {
        // Update local state
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        
        toast({
          title: "Anexo removido",
          description: `${attachment.name} foi removido da tarefa`
        });
      }
      
      return success;
    } catch (error) {
      console.error("Erro ao excluir anexo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o anexo.",
      });
      return false;
    }
  };
  
  return {
    attachments,
    isUploading,
    progress,
    loadAttachments,
    uploadAttachment,
    deleteAttachment
  };
}
