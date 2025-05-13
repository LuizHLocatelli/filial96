
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const inputId = "card-image-upload";
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label 
          htmlFor={inputId} 
          className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}
        >
          Imagem do card
        </label>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-100")}
            onClick={removeImage}
            disabled={isSubmitting}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Remover
          </Button>
        )}
      </div>
      
      {previewUrl ? (
        <div className="relative">
          <div className="border rounded-md overflow-hidden bg-muted aspect-[3/2]">
            <img 
              src={previewUrl} 
              alt="Prévia do card" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-md bg-muted/50 p-4 text-center">
          <Upload className={cn("text-muted-foreground mb-2", isMobile ? "h-5 w-5" : "h-6 w-6")} />
          <p className={cn("text-muted-foreground mb-2", isMobile ? "text-xs" : "text-sm")}>
            Arraste e solte uma imagem ou clique para selecionar
          </p>
          <Button
            type="button"
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className={cn(isMobile && "text-xs h-8")}
            disabled={isSubmitting}
            asChild
          >
            <label htmlFor={inputId}>
              Selecionar imagem
            </label>
          </Button>
          <Input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}
