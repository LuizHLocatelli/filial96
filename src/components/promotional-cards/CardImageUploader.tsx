import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, ZoomIn, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface CardImageUploaderProps {
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  isSubmitting: boolean;
  aspectRatio?: "1:1" | "3:4" | "4:5";
}

export function CardImageUploader({
  previewUrl,
  handleFileChange,
  removeImage,
  isSubmitting,
  aspectRatio = "4:5"
}: CardImageUploaderProps) {
  const isMobile = useIsMobile();
  const inputId = "card-image-upload";
  const [isDragging, setIsDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square";
      case "3:4":
        return "aspect-[3/4]";
      case "4:5":
        return "aspect-[4/5]";
      default:
        return "aspect-[4/5]";
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        // Criar evento sintético para reutilizar handleFileChange
        const syntheticEvent = {
          target: {
            files: files
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(syntheticEvent);
      }
    }
  }, [handleFileChange]);

  const handleClick = () => {
    if (!isSubmitting) {
      document.getElementById(inputId)?.click();
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label 
          htmlFor={inputId} 
          className={cn("font-medium flex items-center gap-2", isMobile ? "text-xs" : "text-sm")}
        >
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          Imagem do card
          <span className="text-red-500">*</span>
        </label>
      </div>
      
      {previewUrl ? (
        <div className="relative group">
          {/* Container principal com preview maior */}
          <div 
            className={cn(
              "border rounded-xl overflow-hidden bg-muted shadow-sm transition-all duration-200",
              "group-hover:shadow-md",
              getAspectRatioClass()
            )}
          >
            <img 
              src={previewUrl} 
              alt="Prévia do card" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay com ações */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                  >
                    <ZoomIn className="mr-1.5 h-4 w-4" />
                    Ampliar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0 bg-background/95 backdrop-blur-sm">
                  <div className={cn("w-full bg-black/5 flex items-center justify-center p-4", getAspectRatioClass())}>
                    <img 
                      src={previewUrl} 
                      alt="Prévia ampliada" 
                      className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                disabled={isSubmitting}
              >
                <X className="mr-1.5 h-4 w-4" />
                Remover
              </Button>
            </div>
          </div>
          
          {/* Badge com formato */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {aspectRatio}
          </div>
        </div>
      ) : (
        <div 
          ref={dropZoneRef}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 min-h-[240px]",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isSubmitting}
          />
          
          {/* Ícone animado durante drag */}
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-200",
            isDragging 
              ? "bg-primary/20 scale-110" 
              : "bg-primary/10"
          )}>
            <Upload className={cn(
              "h-8 w-8 transition-colors duration-200",
              isDragging ? "text-primary" : "text-primary/60"
            )} />
          </div>
          
          <div className="text-center space-y-2 px-4">
            <p className={cn(
              "font-medium transition-colors duration-200",
              isDragging ? "text-primary" : "text-foreground",
              isMobile ? "text-sm" : "text-base"
            )}>
              {isDragging ? "Solte a imagem aqui" : "Arraste e solte uma imagem"}
            </p>
            <p className="text-muted-foreground text-xs">
              ou clique para selecionar
            </p>
            <p className="text-muted-foreground/60 text-xs">
              PNG, JPG ou WEBP • Máx. 10MB
            </p>
          </div>
          
          {/* Indicador de formato recomendado */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
            <span className="text-[10px] text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded">
              Formatos: 1:1, 3:4, 4:5
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
