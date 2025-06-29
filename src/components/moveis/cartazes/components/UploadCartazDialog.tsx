
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartazFolders } from "../hooks/useCartazFolders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Upload, FileText, FileImage } from "lucide-react";

interface UploadCartazDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string | null;
  onUploadSuccess: () => void;
}

export function UploadCartazDialog({ 
  open, 
  onOpenChange, 
  folderId, 
  onUploadSuccess 
}: UploadCartazDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderId);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { folders } = useCartazFolders();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Arquivo inválido",
          description: "Apenas imagens (JPG, PNG, GIF, WebP) e PDFs são aceitos",
          variant: "destructive"
        });
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
      
      // Se não há título, usar nome do arquivo
      if (!title) {
        const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExtension);
      }
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
        .insert([{
          title: title.trim(),
          file_url: data.publicUrl,
          file_type: fileType,
          folder_id: selectedFolderId,
          position: 0
        }]);

      if (dbError) throw dbError;

      // Reset form
      setTitle("");
      setFile(null);
      setSelectedFolderId(folderId);
      onOpenChange(false);
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

  const resetForm = () => {
    setTitle("");
    setFile(null);
    setSelectedFolderId(folderId);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cartaz</DialogTitle>
        </DialogHeader>
        
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

          <div>
            <Label htmlFor="folder">Pasta (opcional)</Label>
            <Select value={selectedFolderId || ""} onValueChange={(value) => setSelectedFolderId(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma pasta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem pasta</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file">Arquivo</Label>
            <div className="mt-2">
              <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      {file.type.startsWith('image/') ? (
                        <FileImage className="w-8 h-8 mb-2 text-primary" />
                      ) : (
                        <FileText className="w-8 h-8 mb-2 text-primary" />
                      )}
                      <p className="text-sm text-foreground font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar arquivo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, JPG, PNG, GIF ou WebP (máx. 10MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Enviando..." : "Enviar Cartaz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
