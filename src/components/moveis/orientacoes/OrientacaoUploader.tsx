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
    <OrientacaoForm
      form={form}
      arquivo={arquivo}
      isUploading={isUploading}
      progress={progress}
      handleFileChange={handleFileChange}
      onSubmit={onSubmit}
    />
  );
}
