import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { DirectoryCategory } from '../types';

interface FileUploadSectionProps {
  isUploading: boolean;
  onUpload: (files: FileList | File[], categoryId?: string) => Promise<void>;
  categories: DirectoryCategory[];
}

export function FileUploadSection({ 
  isUploading, 
  onUpload, 
  categories 
}: FileUploadSectionProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    await onUpload(files);
  };

  return (
    <div className="md:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload de Arquivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Clique para enviar ou arraste arquivos aqui
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            <Button 
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 