import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { DirectoryFile } from '../types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PDFViewer } from '@/components/ui/pdf-viewer/index';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface FileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: DirectoryFile | null;
}

export function FileViewer({ open, onOpenChange, file }: FileViewerProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  
  if (!file) return null;

  const isPdf = file.file_type?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf');
  const isImage = file.file_type?.includes('image') || 
                  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name || '');
  
  const handleDialogChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              {file.name}
            </div>
          </DialogTitle>
          {file.description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {file.description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-6">
          {isPdf && (
            <div className="w-full h-[60vh] border rounded-lg">
              <PDFViewer 
                url={file.file_url} 
                className="h-full w-full rounded-lg" 
              />
            </div>
          )}
          
          {isImage && (
            <div className="w-full">
              <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
                <img
                  src={file.file_url}
                  alt={file.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              </AspectRatio>
            </div>
          )}
          
          {!isPdf && !isImage && (
            <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-muted-foreground mb-2">
                Pré-visualização não disponível para este tipo de arquivo.
              </p>
              <p className="text-sm text-muted-foreground">
                Clique no botão abaixo para baixar e visualizar o arquivo.
              </p>
            </div>
          )}
        </div>
        
        <div {...getMobileFooterProps()}>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="px-6"
          >
            Fechar
          </Button>
          <Button 
            asChild
            variant="success"
          >
            <a 
              href={file.file_url} 
              download 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
