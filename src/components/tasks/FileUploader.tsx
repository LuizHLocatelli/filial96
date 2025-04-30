
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, Image as ImageIcon, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Attachment } from "@/types";
import { ensureBucketExists, isImageFile } from "@/utils/storage-helper";

interface FileUploaderProps {
  taskId: string;
  onFileUploaded: (attachment: Attachment) => void;
}

export function FileUploader({ taskId, onFileUploaded }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

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

    setIsUploading(true);
    try {
      // Ensure the attachments bucket exists
      const bucketExists = await ensureBucketExists("attachments");
      
      if (!bucketExists) {
        throw new Error("Não foi possível criar ou acessar o bucket de anexos.");
      }
      
      // 1. Upload the file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const filePath = `${taskId}/${fileName}.${fileExt}`;
      
      console.log("Iniciando upload para taskId:", taskId);
      console.log("Usuário logado:", user.id);
      console.log("Caminho do arquivo:", filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload concluído:", uploadData);

      // 2. Get public URL of the file
      const { data: { publicUrl } } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);
        
      console.log("URL pública:", publicUrl);

      // 3. Determine the file type
      const fileType = "image"; // Always 'image' since we're only accepting images now
      
      // 4. Save attachment information in the database
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
        throw attachmentError;
      }
      
      console.log("Anexo salvo:", attachmentData);

      // 5. Notify success and clear the state
      toast({
        title: "Arquivo enviado com sucesso",
        description: `${file.name} foi anexado à tarefa.`,
      });

      // 6. Map received data to the expected Attachment interface format
      const formattedAttachment: Attachment = {
        id: attachmentData.id,
        name: attachmentData.name,
        type: attachmentData.type as 'image',
        url: attachmentData.url,
        createdAt: attachmentData.created_at,
        createdBy: attachmentData.created_by,
        taskId: attachmentData.task_id
      };
      
      // 7. Call callback with the formatted attachment
      onFileUploaded(formattedAttachment);
      setFile(null);
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar arquivo",
        description: "Não foi possível fazer o upload do arquivo. Tente novamente mais tarde.",
      });
    } finally {
      setIsUploading(false);
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
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
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
              disabled={isUploading}
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
    </div>
  );
}
