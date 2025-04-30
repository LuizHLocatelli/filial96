
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Attachment } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { checkBucketExists, isImageFile } from "@/utils/storage-helper";

interface UseFileUploadProps {
  taskId: string;
  onFileUploaded: (attachment: Attachment) => void;
}

export function useFileUpload({ taskId, onFileUploaded }: UseFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!isImageFile(selectedFile)) {
        toast({
          variant: "destructive",
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione apenas imagens (PNG ou JPEG).",
        });
        e.target.value = '';
        return;
      }
      
      // Verificar tamanho do arquivo (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é de 5MB.",
        });
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const clearFile = () => setFile(null);

  const handleUpload = async () => {
    if (!file || !user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um arquivo e certifique-se de estar logado.",
      });
      return;
    }

    if (!taskId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID da tarefa não fornecido. Salve a tarefa primeiro.",
      });
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Verificar se o bucket existe
      const bucketExists = await checkBucketExists("attachments");
      
      if (!bucketExists) {
        throw new Error("O bucket de armazenamento não existe. Entre em contato com o administrador.");
      }
      
      // 1. Upload do arquivo para o storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const filePath = `${taskId}/${fileName}.${fileExt}`;
      
      console.log("Iniciando upload:", {
        taskId, 
        usuarioId: user.id,
        caminho: filePath,
        bucketName: "attachments"
      });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        throw new Error(uploadError.message);
      }
      
      console.log("Upload concluído:", uploadData);

      // 2. Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);
        
      console.log("URL pública:", publicUrl);

      // 3. Determinar o tipo de arquivo
      const fileType = isImageFile(file) ? "image" : "file";
      
      // 4. Salvar informações do anexo no banco de dados
      const { data: attachmentData, error: attachmentError } = await supabase
        .from("attachments")
        .insert([
          {
            task_id: taskId,
            name: file.name,
            type: fileType,
            url: publicUrl,
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (attachmentError) {
        console.error("Erro ao salvar anexo:", attachmentError);
        throw new Error(attachmentError.message);
      }
      
      console.log("Anexo salvo:", attachmentData);

      // 5. Notificar sucesso e limpar o estado
      toast({
        title: "Arquivo enviado com sucesso",
        description: `${file.name} foi anexado à tarefa.`,
      });

      // 6. Mapear dados recebidos para o formato esperado pela interface Attachment
      const formattedAttachment: Attachment = {
        id: attachmentData.id,
        name: attachmentData.name,
        type: attachmentData.type as 'image',
        url: attachmentData.url,
        createdAt: attachmentData.created_at,
        createdBy: attachmentData.created_by,
        taskId: attachmentData.task_id
      };
      
      // 7. Chamar callback com o anexo formatado
      onFileUploaded(formattedAttachment);
      setFile(null);
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      let errorMessage = "Não foi possível fazer o upload do arquivo. Tente novamente mais tarde.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erro ao enviar arquivo",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    file,
    isUploading,
    uploadError,
    handleFileChange,
    clearFile,
    handleUpload
  };
}
