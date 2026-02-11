import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from '@/components/ui/standard-dialog';
import { FileText, Image as ImageIcon, Download, X, ExternalLink } from 'lucide-react';
import type { Curriculo, JobPosition } from '@/types/curriculos';
import { jobPositionLabels, jobPositionColors } from '@/types/curriculos';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden max-h-[90vh]" hideCloseButton>
        <StandardDialogHeader
          icon={isPdf ? FileText : ImageIcon}
          iconColor="blue"
          title={curriculo.candidate_name}
          description={formatDate(curriculo.created_at)}
          onClose={() => onOpenChange(false)}
        />

        <StandardDialogContent className="p-0">
          {/* Preview */}
          <div className="relative bg-muted min-h-[400px] max-h-[60vh] overflow-auto flex items-center justify-center">
            {isPdf ? (
              <iframe
                src={`${curriculo.file_url}#view=FitH`}
                title={`Currículo de ${curriculo.candidate_name}`}
                className="w-full h-[60vh] border-0"
              />
            ) : (
              <img
                src={curriculo.file_url}
                alt={`Currículo de ${curriculo.candidate_name}`}
                className="max-w-full max-h-[60vh] object-contain"
              />
            )}
          </div>

          {/* Info Bar */}
          <div className="px-6 py-4 border-t bg-muted/30 flex flex-wrap items-center gap-4">
            <Badge 
              variant="outline" 
              className={cn(
                jobPositionColors[curriculo.job_position as JobPosition]
              )}
            >
              {jobPositionLabels[curriculo.job_position as JobPosition]}
            </Badge>
            
            <Badge variant="secondary">
              {isPdf ? 'PDF' : 'Imagem'}
            </Badge>

            {curriculo.file_size && (
              <span className="text-sm text-muted-foreground">
                {formatFileSize(curriculo.file_size)}
              </span>
            )}
          </div>
        </StandardDialogContent>

        <StandardDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-1" />
            Fechar
          </Button>
          
          <a
            href={curriculo.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Baixar
            </Button>
          </a>
          
          <a
            href={curriculo.file_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>
              <ExternalLink className="h-4 w-4 mr-1" />
              Abrir em Nova Aba
            </Button>
          </a>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
