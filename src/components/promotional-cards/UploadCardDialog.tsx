
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFolders } from "@/hooks/useFolders";
import { v4 as uuidv4 } from "uuid";

interface UploadCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion";
  folderId: string | null;
}

export function UploadCardDialog({ open, onOpenChange, sector, folderId: initialFolderId }: UploadCardDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);
  const { user } = useAuth();
  const { folders } = useFolders(sector);
  
  // Reset state when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTitle("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setFolderId(initialFolderId);
    }
    onOpenChange(open);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "O arquivo selecionado não é uma imagem",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título para o card",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar cards promocionais",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${sector}/${uuidv4()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('promotional_cards')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: publicUrlData } = await supabase.storage
        .from('promotional_cards')
        .getPublicUrl(filePath);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // 3. Save card data to database
      // Get the highest current position to place the new card at the end
      const { data: positionData } = await supabase
        .from('promotional_cards')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      
      const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0;
      
      const { error: insertError } = await supabase.from('promotional_cards').insert({
        title: title.trim(),
        image_url: imageUrl,
        folder_id: folderId,
        sector,
        created_by: user.id,
        position
      });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Sucesso",
        description: "Card promocional criado com sucesso"
      });
      
      handleOpenChange(false);
    } catch (error) {
      console.error('Error creating promotional card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o card promocional",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Card Promocional</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-title">Título</Label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do card promocional"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card-folder">Pasta (opcional)</Label>
            <Select 
              value={folderId || ""} 
              onValueChange={(value) => setFolderId(value || null)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma pasta (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma pasta</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card-image">Imagem</Label>
            {previewUrl ? (
              <div className="mt-2 relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-[200px] rounded-md mx-auto object-contain"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={isSubmitting}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-8 text-center">
                <Input
                  id="card-image"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <Label 
                  htmlFor="card-image" 
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para selecionar uma imagem
                  </span>
                </Label>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Card'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
