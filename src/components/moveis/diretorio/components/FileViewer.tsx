
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
import { useState } from 'react';

interface FileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: DirectoryFile | null;
}

export function FileViewer({ open, onOpenChange, file }: FileViewerProps) {
  const [pdfError, setPdfError] = useState(false);
  
  if (!file) return null;

  const isPdf = file.file_type?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf');
  const isImage = file.file_type?.includes('image') || 
                  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name || '');
  
  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPdfError(false); // Reset error state when closing
    }
    onOpenChange(newOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
          {file.description && (
            <DialogDescription>
              {file.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          {isPdf && (
            <div className="w-full">
              <PDFViewer 
                url={file.file_url} 
                className="min-h-[500px]" 
              />
            </div>
          )}
          
          {isImage && (
            <div className="w-full">
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
        <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}
