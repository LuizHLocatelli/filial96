import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Eye } from 'lucide-react';
import { DirectoryFile } from '../types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PDFViewer } from '@/components/ui/pdf-viewer/index';
import { useIsMobile } from '@/hooks/use-mobile';
import { StandardDialogHeader, StandardDialogFooter } from '@/components/ui/standard-dialog';

interface FileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: DirectoryFile | null;
}

export function FileViewer({ open, onOpenChange, file }: FileViewerProps) {
  const isMobile = useIsMobile();
  
  if (!file) return null;

  const isPdf = file.file_type?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf');
  const isImage = file.file_type?.includes('image') || 
                  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name || '');
  
  const handleDialogChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[900px] p-0'} max-h-[95vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Eye}
          iconColor="primary"
          title={file.name}
          description={file.description}
          onClose={() => onOpenChange(false)}
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-0">
            {isPdf && (
              <div className="w-full h-[75vh] min-h-[500px]">
                <PDFViewer 
                  url={file.file_url} 
                  className="h-full w-full" 
                />
              </div>
            )}
            
            {isImage && (
              <div className="w-full p-4">
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
              <div className="text-center py-16 p-4">
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
        </div>
        
        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className={isMobile ? 'w-full' : 'px-6'}
          >
            Fechar
          </Button>
          <Button 
            asChild
            variant="success"
            className={isMobile ? 'w-full' : ''}
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
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
