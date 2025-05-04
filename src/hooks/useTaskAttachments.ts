
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/auth";

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

export function useTaskAttachments(taskId?: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadAttachments = async (taskId: string) => {
    if (!taskId) return;
    
    try {
      // Buscar anexos da tabela attachments
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('task_id', taskId);
      
      if (error) throw error;
      
      // Formatar os resultados
      const formattedAttachments = data.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        createdAt: item.created_at
      }));
      
      setAttachments(formattedAttachments);
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
    }
  };
  
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
      setIsUploading(true);
      // Set initial progress
      setProgress(10);
      
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: "Apenas imagens (JPEG, PNG, WebP) e PDFs são permitidos",
          variant: "destructive",
        });
        return null;
      }
      
      // Validar tamanho (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB",
          variant: "destructive",
        });
        return null;
      }
      
      // Simulating progress for better UX
      setProgress(30);
      
      // Gerar um nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${effectiveTaskId}/${fileName}`;
      
      // Set progress to show upload is progressing
      setProgress(50);
      
      // Upload para o bucket do Supabase
      const { error: uploadError, data } = await supabase.storage
        .from('task_attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Set progress to show upload is complete
      setProgress(80);
      
      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('task_attachments')
        .getPublicUrl(filePath);
      
      // Salvar informações do anexo no banco de dados
      const attachmentData = {
        id: uuidv4(),
        task_id: effectiveTaskId,
        name: file.name,
        url: publicUrl,
        type: file.type,
        created_by: user.id
      };
      
      const { error: dbError } = await supabase
        .from('attachments')
        .insert(attachmentData);
      
      if (dbError) throw dbError;
      
      // Adicionar o novo anexo à lista
      const newAttachment = {
        id: attachmentData.id,
        name: file.name,
        url: publicUrl,
        type: file.type,
        createdAt: new Date().toISOString()
      };
      
      setAttachments(prev => [...prev, newAttachment]);
      
      // Set progress to 100% when fully complete
      setProgress(100);
      
      toast({
        title: "Upload concluído",
        description: `${file.name} foi anexado à tarefa`
      });
      
      return newAttachment;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível anexar o arquivo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      // Reset progress after a delay to show completion
      setTimeout(() => setProgress(0), 1000);
    }
  };
  
  const deleteAttachment = async (attachmentId: string) => {
    try {
      // Primeiro encontrar o anexo para obter o path do storage
      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return false;
      
      // Extrair o caminho do arquivo da URL
      const urlParts = attachment.url.split('task_attachments/');
      if (urlParts.length < 2) return false;
      
      const storagePath = urlParts[1];
      
      // Excluir o arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('task_attachments')
        .remove([storagePath]);
      
      if (storageError) throw storageError;
      
      // Excluir o registro do banco de dados
      const { error: dbError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (dbError) throw dbError;
      
      // Atualizar a lista de anexos
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      
      toast({
        title: "Anexo removido",
        description: `${attachment.name} foi removido da tarefa`
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir anexo:", error);
      toast({
        title: "Erro ao excluir anexo",
        description: "Não foi possível remover o arquivo",
        variant: "destructive",
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
