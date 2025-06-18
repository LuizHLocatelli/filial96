
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DirectoryFile } from '../types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PDFViewer } from '@/components/ui/pdf-viewer';

interface FileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: DirectoryFile | null;
}

export function FileViewer({ open, onOpenChange, file }: FileViewerProps) {
  if (!file) return null;

  const isPdf = file.file_type?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf');
  const isImage = file.file_type?.includes('image') || 
                  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name || '');
  
  const handleDialogChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={`${
        isPdf 
          ? 'w-[95vw] max-w-[95vw] max-h-[85vh]' 
          : 'sm:max-w-[900px] max-h-[80vh]'
      } overflow-hidden flex flex-col`}>
        <DialogHeader className="pb-2">
          <DialogTitle>{file.name}</DialogTitle>
          {file.description && (
            <DialogDescription>
              {file.description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isPdf && (
            <div className="w-full h-full">
              <PDFViewer 
                url={file.file_url} 
                className="h-full w-full" 
              />
            </div>
          )}
          
          {isImage && (
            <div className="w-full overflow-y-auto py-4">
              <AspectRatio ratio={16 / 9} className="bg-muted">
                <img
                  src={file.file_url}
                  alt={file.name}
                  className="w-full h-full object-contain rounded-md"
                />
              </AspectRatio>
            </div>
          )}
          
          {!isPdf && !isImage && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Pré-visualização não disponível para este tipo de arquivo.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique no botão abaixo para baixar e visualizar o arquivo.
              </p>
            </div>
          )}
        </div>
        
        {!isPdf && (
          <DialogFooter className="pt-2">
            <Button asChild>
              <a 
                href={file.file_url} 
                download 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Baixar</span>
              </a>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
