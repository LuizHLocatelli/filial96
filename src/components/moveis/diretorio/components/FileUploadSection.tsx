
import { FileUploader } from '@/components/crediario/diretorio/components/FileUploader';
import { DirectoryCategory } from '@/components/crediario/diretorio/types';

interface FileUploadSectionProps {
  isUploading: boolean;
  onUpload: (file: File, categoryId: string | null, isFeatured: boolean) => Promise<boolean>;
  categories: DirectoryCategory[];
}

export function FileUploadSection({ 
  isUploading, 
  onUpload, 
  categories 
}: FileUploadSectionProps) {
  return (
    <div className="md:col-span-1">
      <FileUploader 
        isUploading={isUploading}
        onUpload={onUpload}
        categories={categories}
      />
    </div>
  );
}
