
import { Attachment } from "@/types";
import { FileSelector } from "./FileSelector";
import { FilePreview } from "./FilePreview";
import { UploadError } from "./UploadError";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploaderProps {
  taskId: string;
  onFileUploaded: (attachment: Attachment) => void;
}

export function FileUploader({ taskId, onFileUploaded }: FileUploaderProps) {
  const {
    file,
    isUploading,
    uploadError,
    handleFileChange,
    clearFile,
    handleUpload
  } = useFileUpload({ taskId, onFileUploaded });

  return (
    <div className="space-y-4">
      {uploadError && <UploadError message={uploadError} />}
      
      <FileSelector
        onChange={handleFileChange}
        onClear={clearFile}
        disabled={isUploading}
        hasFile={!!file}
      />

      {file && (
        <FilePreview
          file={file}
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}
