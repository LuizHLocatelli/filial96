
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Attachment } from "@/types";

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
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // 1. Fazer o upload do arquivo para o storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${taskId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);

      // 3. Determinar o tipo de arquivo
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";

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
        throw attachmentError;
      }

      // 5. Notificar sucesso e limpar o estado
      toast({
        title: "Arquivo enviado com sucesso",
        description: `${file.name} foi anexado à tarefa.`,
      });

      // 6. Mapear os dados recebidos do Supabase para o formato esperado pela interface Attachment
      const formattedAttachment: Attachment = {
        id: attachmentData.id,
        name: attachmentData.name,
        type: attachmentData.type as 'image' | 'pdf',
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
      toast({
        variant: "destructive",
        title: "Erro ao enviar arquivo",
        description: "Não foi possível fazer o upload do arquivo.",
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
          accept="image/*, application/pdf"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Escolher arquivo
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
            {file.type.startsWith("image/") ? (
              <ImageIcon className="h-6 w-6 text-blue-500 mr-2" />
            ) : (
              <FileText className="h-6 w-6 text-red-500 mr-2" />
            )}
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
            >
              {isUploading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
