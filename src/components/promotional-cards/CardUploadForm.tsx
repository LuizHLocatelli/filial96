
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useFolders } from "@/hooks/useFolders";
import { CardImageUploader } from "./CardImageUploader";

interface CardUploadFormProps {
  sector: "furniture" | "fashion";
  title: string;
  setTitle: (title: string) => void;
  folderId: string | null;
  setFolderId: (folderId: string | null) => void;
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CardUploadForm({
  sector,
  title,
  setTitle,
  folderId,
  setFolderId,
  previewUrl,
  handleFileChange,
  removeImage,
  handleSubmit,
  isSubmitting,
  onCancel
}: CardUploadFormProps) {
  const { folders } = useFolders(sector);

  return (
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
          value={folderId || "none"} 
          onValueChange={(value) => setFolderId(value === "none" ? null : value)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma pasta (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma pasta</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <CardImageUploader
        previewUrl={previewUrl}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
        isSubmitting={isSubmitting}
      />
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !previewUrl}
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
  );
}
