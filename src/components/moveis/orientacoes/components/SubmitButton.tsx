
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface SubmitButtonProps {
  isUploading: boolean;
}

export function SubmitButton({ isUploading }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isUploading}>
      {isUploading ? (
        <>
          <FileText className="mr-2 h-4 w-4 animate-pulse" />
          Enviando...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Enviar Orientação
        </>
      )}
    </Button>
  );
}
