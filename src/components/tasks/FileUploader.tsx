
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, Image as ImageIcon, Upload, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Attachment } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateUniqueFileName, isImageFile } from "@/utils/storage-helper";

interface FileUploaderProps {
  taskId: string;
  onFileUploaded: (attachment: Attachment) => void;
}

export function FileUploader({ taskId, onFileUploaded }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isBucketAvailable, setIsBucketAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

  // Verificar se o bucket attachments existe ao montar o componente
  useEffect(() => {
    const checkBucket = async () => {
      if (!taskId) return;
      
      try {
        setErrorMessage(null);
        
        // Verificar se o bucket existe fazendo uma lista vazia
        const { data, error } = await supabase.storage
          .from("attachments")
          .list(taskId, { limit: 1 });
        
        if (error) {
          console.error("Erro ao verificar bucket:", error);
          setIsBucketAvailable(false);
          setErrorMessage(
            error.message.includes("does not exist") || error.message.includes("não existe")
              ? "O bucket 'attachments' não foi encontrado. Crie-o no console do Supabase."
              : `Problema no acesso ao armazenamento: ${error.message}`
          );
          return;
        }
        
        setIsBucketAvailable(true);
        console.log("Bucket 'attachments' está acessível");
      } catch (error: any) {
        console.error("Erro ao verificar bucket:", error);
        setIsBucketAvailable(false);
        setErrorMessage(`Erro ao verificar armazenamento: ${error.message || "Erro desconhecido"}`);
      }
    };
    
    if (taskId) {
      checkBucket();
    }
  }, [taskId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setFile(selectedFile);
    }
  };

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
    
    if (!isBucketAvailable) {
      toast({
        variant: "destructive",
        title: "Erro de armazenamento",
        description: errorMessage || "O sistema de armazenamento não está disponível.",
      });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Gerar um nome único para o arquivo para evitar colisões
      const uniqueFileName = generateUniqueFileName(file.name);
      const filePath = `${taskId}/${uniqueFileName}`;
      
      console.log("Iniciando upload para taskId:", taskId);
      console.log("Usuário logado:", user.id);
      console.log("Caminho do arquivo:", filePath);
      
      // 2. Fazer upload do arquivo para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }
      
      console.log("Upload concluído:", uploadData);

      // 3. Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);
        
      console.log("URL pública:", publicUrl);

      // 4. Salvar informações do anexo no banco de dados
      const { data: attachmentData, error: attachmentError } = await supabase
        .from("attachments")
        .insert([
          {
            task_id: taskId,
            name: file.name,
            type: "image",
            url: publicUrl,
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (attachmentError) {
        console.error("Erro ao salvar anexo:", attachmentError);
        throw new Error(`Erro ao salvar anexo: ${attachmentError.message}`);
      }
      
      console.log("Anexo salvo:", attachmentData);

      // 5. Notificar sucesso e limpar o estado
      toast({
        title: "Arquivo enviado com sucesso",
        description: `${file.name} foi anexado à tarefa.`,
      });

      // 6. Mapear os dados recebidos para o formato esperado pela interface Attachment
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
    } catch (error: any) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar arquivo",
        description: error.message || "Não foi possível fazer o upload do arquivo. Tente novamente mais tarde.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const retryBucketCheck = async () => {
    setIsBucketAvailable(null);
    setErrorMessage(null);
    
    try {
      // Tentar verificar o bucket novamente
      const { data, error } = await supabase.storage
        .from("attachments")
        .list(taskId || "", { limit: 1 });
      
      if (error) {
        console.error("Erro ao verificar bucket:", error);
        setIsBucketAvailable(false);
        setErrorMessage(
          error.message.includes("does not exist") || error.message.includes("não existe")
            ? "O bucket 'attachments' não foi encontrado. Crie-o no console do Supabase."
            : `Problema no acesso ao armazenamento: ${error.message}`
        );
        return;
      }
      
      setIsBucketAvailable(true);
      toast({
        title: "Conexão restaurada",
        description: "O sistema de armazenamento está disponível agora.",
      });
    } catch (error: any) {
      console.error("Erro ao verificar bucket:", error);
      setIsBucketAvailable(false);
      setErrorMessage(`Erro ao verificar armazenamento: ${error.message || "Erro desconhecido"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          disabled={isBucketAvailable === false}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isBucketAvailable === false
              ? "opacity-50 pointer-events-none"
              : "hover:bg-accent hover:text-accent-foreground"
          } border border-input bg-background h-10 px-4 py-2`}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Escolher imagem
        </label>
        {file && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFile(null)}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Remover
          </Button>
        )}
      </div>

      {file && (
        <div className="border rounded-md p-3 bg-slate-50">
          <div className="flex items-center">
            <ImageIcon className="h-6 w-6 text-blue-500 mr-2" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || isBucketAvailable === false}
              size="sm"
              className="gap-1"
            >
              {isUploading ? "Enviando..." : (
                <>
                  <Upload className="h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {isBucketAvailable === false && errorMessage && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2">
            <p>{errorMessage}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="self-start"
              onClick={retryBucketCheck}
            >
              Verificar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {isBucketAvailable === null && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          <p>Verificando disponibilidade do armazenamento...</p>
        </div>
      )}
    </div>
  );
}
