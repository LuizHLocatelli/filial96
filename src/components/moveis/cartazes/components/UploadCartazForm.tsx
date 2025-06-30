
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { FileUploadZone } from "./FileUploadZone";
import { FolderSelector } from "./FolderSelector";

interface UploadCartazFormProps {
  folderId: string | null;
  onUploadSuccess: () => void;
  onCancel: () => void;
}

export function UploadCartazForm({ folderId, onUploadSuccess, onCancel }: UploadCartazFormProps) {
  const [title, setTitle] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderId);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (selectedFile: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Arquivo inválido",
        description: "Apenas imagens (JPG, PNG, GIF, WebP) e PDFs são aceitos",
        variant: "destructive"
      });
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && !validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    
    if (selectedFile && !title) {
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExtension);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('cartazes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('cartazes')
        .getPublicUrl(filePath);

      // Determinar tipo do arquivo
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

      // Salvar no banco
      const { error: dbError } = await supabase
        .from('cartazes')
        .insert({
          title: title.trim(),
          file_url: data.publicUrl,
          file_type: fileType as 'pdf' | 'image',
          folder_id: selectedFolderId,
          position: 0,
          created_by: user.id
        });

      if (dbError) throw dbError;

      onUploadSuccess();
      
      toast({
        title: "Sucesso",
        description: "Cartaz enviado com sucesso"
      });
    } catch (error) {
      console.error('Error uploading cartaz:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o cartaz",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do cartaz"
          disabled={isUploading}
        />
      </div>

      <FolderSelector
        value={selectedFolderId}
        onChange={setSelectedFolderId}
      />

      <FileUploadZone
        file={file}
        onFileChange={handleFileChange}
        disabled={isUploading}
      />
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Enviando..." : "Enviar Cartaz"}
        </Button>
      </div>
    </form>
  );
}
