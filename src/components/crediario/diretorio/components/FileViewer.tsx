
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
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
  const [hasError, setHasError] = useState(false);

  if (!file) return null;

  const isPdf = file.file_type?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf');
  const isImage = file.file_type?.includes('image') || 
                  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name || '');
  
  const handleDialogChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const openFileInNewWindow = () => {
    window.open(file.file_url, '_blank');
  };

  const handleDownload = () => {
    fetch(file.file_url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name || "documento.pdf";
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
        setHasError(true);
      });
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <DialogTitle>{file.name}</DialogTitle>
            {file.description && (
              <DialogDescription>
                {file.description}
              </DialogDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openFileInNewWindow}
              className="whitespace-nowrap"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir externamente
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isPdf && (
            <div className="border rounded-lg overflow-hidden bg-muted/10 h-[70vh]">
              <PDFViewer 
                url={file.file_url} 
                className="h-full" 
              />
            </div>
          )}
          
          {isImage && (
            <div className="w-full h-[70vh] overflow-auto">
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
      </DialogContent>
    </Dialog>
  );
}
