
import { Card } from "@/components/ui/card";
import { useOrientacaoUpload } from "./hooks/useOrientacaoUpload";
import { OrientacaoForm } from "./components/OrientacaoForm";

interface OrientacaoUploaderProps {
  onSuccess?: () => void;
}

export function OrientacaoUploader({ onSuccess }: OrientacaoUploaderProps) {
  const { 
    form, 
    arquivo, 
    isUploading, 
    progress, 
    handleFileChange, 
    onSubmit 
  } = useOrientacaoUpload({ onSuccess });

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-1">Nova Orientação</h3>
        <p className="text-muted-foreground text-sm">
          Envie uma nova orientação ou informativo para o setor de móveis
        </p>
      </div>

      <OrientacaoForm
        form={form}
        arquivo={arquivo}
        isUploading={isUploading}
        progress={progress}
        handleFileChange={handleFileChange}
        onSubmit={onSubmit}
      />
    </Card>
  );
}
