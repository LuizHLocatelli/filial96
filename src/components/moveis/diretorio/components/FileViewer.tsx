
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { Eye, Download, FileText, Image, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DirectoryFile } from '../types';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface FileViewerProps {
  file: DirectoryFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileViewer({ file, open, onOpenChange }: FileViewerProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  if (!file) return null;

  const isPdf = file.file_type?.includes('pdf');
  const isImage = file.file_type?.includes('image');
  
  const handleDownload = () => {
    window.open(file.file_url, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContent = () => {
    if (isImage) {
      return (
        <div className="w-full max-h-[60vh] overflow-auto border rounded-lg bg-muted/10 p-4">
          <img
            src={file.file_url}
            alt={file.name}
            className="max-w-full h-auto mx-auto object-contain rounded-lg"
          />
        </div>
      );
    } else if (isPdf) {
      return (
        <div className="w-full h-[60vh] border rounded-lg">
          <PDFViewer url={file.file_url} className="h-full rounded-lg" />
        </div>
      );
    } else {
      return (
        <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-muted-foreground mb-2">
            Este tipo de arquivo não pode ser visualizado diretamente.
          </p>
          <p className="text-sm text-muted-foreground">
            Por favor, faça o download para visualizá-lo.
          </p>
        </div>
      );
    }
  };

  const getFileIcon = () => {
    if (isImage) return Image;
    if (isPdf) return FileText;
    return FileText;
  };

  const FileIcon = getFileIcon();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps('default')}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="break-words">{file.name}</span>
                <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 text-green-700 dark:text-green-300">
                  <FileIcon className="w-3 h-3 mr-1" />
                  {file.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {file.description || 'Visualização de arquivo'}
          </DialogDescription>
          
          {/* Metadados do arquivo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg mt-4">
            {file.file_size && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Tamanho: {formatFileSize(file.file_size)}</span>
              </div>
            )}
            {file.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Criado: {format(new Date(file.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            )}
            {file.created_by && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Por: {file.created_by}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {renderContent()}
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
            onClick={handleDownload}
            variant="success"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
