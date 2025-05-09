
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface CardImageUploaderProps {
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  isSubmitting: boolean;
}

export function CardImageUploader({ 
  previewUrl, 
  handleFileChange, 
  removeImage, 
  isSubmitting 
}: CardImageUploaderProps) {
  return (
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
            onClick={removeImage}
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
  );
}
