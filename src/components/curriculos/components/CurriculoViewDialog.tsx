import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from '@/components/ui/standard-dialog';
import { FileText, Image as ImageIcon, Download, X, ExternalLink } from 'lucide-react';
import type { Curriculo, JobPosition } from '@/types/curriculos';
import { jobPositionLabels, jobPositionColors } from '@/types/curriculos';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PDFViewer } from '@/components/ui/pdf-viewer/index';
import { useIsMobile } from '@/hooks/use-mobile';

interface CurriculoViewDialogProps {
  curriculo: Curriculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CurriculoViewDialog({
  curriculo,
  open,
  onOpenChange
}: CurriculoViewDialogProps) {
  const isMobile = useIsMobile();
  if (!curriculo) return null;

  const isPdf = curriculo.file_type === 'pdf';

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[800px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`} hideCloseButton>
        <StandardDialogHeader
          icon={isPdf ? FileText : ImageIcon}
          iconColor="blue"
          title={curriculo.candidate_name}
          description={formatDate(curriculo.created_at)}
          onClose={() => onOpenChange(false)}
        />

        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          <div className="bg-muted h-[60vh] overflow-hidden rounded-lg">
            {isPdf ? (
              <PDFViewer 
                url={curriculo.file_url} 
                className="w-full h-full"
              />
            ) : (
              <img
                src={curriculo.file_url}
                alt={`Currículo de ${curriculo.candidate_name}`}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Info Bar */}
          <div className="mt-4 px-4 py-3 border-t bg-muted/30 rounded-lg flex flex-wrap items-center gap-2">
            {curriculo.job_position.map((position) => (
              <Badge 
                key={position}
                variant="outline" 
                className={cn(
                  jobPositionColors[position as JobPosition]
                )}
              >
                {jobPositionLabels[position as JobPosition]}
              </Badge>
            ))}
            
            <Badge variant="secondary" className="ml-2">
              {isPdf ? 'PDF' : 'Imagem'}
            </Badge>

            {curriculo.file_size && (
              <span className="text-sm text-muted-foreground ml-2">
                {formatFileSize(curriculo.file_size)}
              </span>
            )}
          </div>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={isMobile ? 'w-full' : ''}
          >
            <X className="h-4 w-4 mr-1" />
            Fechar
          </Button>
          
          <a
            href={curriculo.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={isMobile ? 'w-full' : ''}
          >
            <Button variant="outline" className={isMobile ? 'w-full' : ''}>
              <Download className="h-4 w-4 mr-1" />
              Baixar
            </Button>
          </a>
          
          <a
            href={curriculo.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className={isMobile ? 'w-full' : ''}
          >
            <Button className={isMobile ? 'w-full' : ''}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Abrir em Nova Aba
            </Button>
          </a>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
