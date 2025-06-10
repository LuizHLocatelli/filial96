
import { GlassButton } from "@/components/ui/glass-button";
import { FileText } from "lucide-react";

interface SubmitButtonProps {
  isUploading: boolean;
}

export function SubmitButton({ isUploading }: SubmitButtonProps) {
  return (
    <GlassButton 
      type="submit" 
      variant="primary"
      className="w-full group" 
      disabled={isUploading}
      glow
    >
      {isUploading ? (
        <>
          <FileText className="mr-2 h-4 w-4 animate-pulse" />
          Enviando...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          Enviar Orientação
        </>
      )}
    </GlassButton>
  );
}
