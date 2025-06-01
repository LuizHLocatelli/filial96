
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useTaskAttachments = (taskId: string) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchAttachments = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("task_id", taskId)
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

  const uploadAttachment = async (file: File) => {
    if (!taskId) return;
    
    setIsUploading(true);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // For now, we'll just add a mock attachment since we don't have storage configured
      const mockAttachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        task_id: taskId,
        created_at: new Date().toISOString(),
        created_by: null
      };
      
      setAttachments(prev => [mockAttachment, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Anexo adicionado com sucesso",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao fazer upload do anexo",
      });
    } finally {
      setIsUploading(false);
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
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover anexo",
      });
    }
  };

  return {
    attachments,
    isLoading,
    error,
    isUploading,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
  };
};
