
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useTaskAttachments = (taskId?: string) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadAttachments = async (id?: string) => {
    const targetTaskId = id || taskId;
    if (!targetTaskId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("task_id", targetTaskId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar anexos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttachments = () => loadAttachments(taskId);

  const uploadAttachment = async (file: File, targetTaskId?: string) => {
    const id = targetTaskId || taskId;
    if (!id) return false;
    
    setIsUploading(true);
    setProgress(10);
    
    try {
      // Simular progresso do upload
      setProgress(30);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      setProgress(60);
      
      // For now, we'll just add a mock attachment since we don't have storage configured
      const mockAttachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        task_id: id,
        created_at: new Date().toISOString(),
        created_by: null
      };
      
      setProgress(90);
      setAttachments(prev => [mockAttachment, ...prev]);
      
      setProgress(100);
      
      toast({
        title: "Sucesso",
        description: "Anexo adicionado com sucesso",
      });
      
      return true;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao fazer upload do anexo",
      });
      return false;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    try {
      const { error } = await supabase
        .from("attachments")
        .delete()
        .eq("id", attachmentId);

      if (error) throw error;
      
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      
      toast({
        title: "Sucesso",
        description: "Anexo removido com sucesso",
      });
      return true;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover anexo",
      });
      return false;
    }
  };

  return {
    attachments,
    isLoading,
    error,
    isUploading,
    progress,
    loadAttachments,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
  };
};
