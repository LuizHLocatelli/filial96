import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image as ImageIcon, Eye, Download, Trash2, Calendar } from 'lucide-react';
import type { Curriculo, JobPosition } from '@/types/curriculos';
import { jobPositionLabels, jobPositionColors } from '@/types/curriculos';
import { cn } from '@/lib/utils';

interface CurriculoCardProps {
  curriculo: Curriculo;
  onView: (curriculo: Curriculo) => void;
  onDelete: (curriculo: Curriculo) => void;
}

export function CurriculoCard({ curriculo, onView, onDelete }: CurriculoCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  const isPdf = curriculo.file_type === 'pdf';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Preview Area */}
      <div 
        className="relative aspect-[4/3] bg-muted cursor-pointer group"
        onClick={() => onView(curriculo)}
      >
        {isPdf || imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            {isPdf ? (
              <FileText className="h-16 w-16 text-red-500 mb-2" />
            ) : (
              <ImageIcon className="h-16 w-16 text-blue-500 mb-2" />
            )}
            <p className="text-sm text-muted-foreground">
              {isPdf ? 'PDF' : 'Imagem'}
            </p>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>
        ) : (
          <>
            <img
              src={curriculo.file_url}
              alt={`Currículo de ${curriculo.candidate_name}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </>
        )}

        {/* File Type Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 bg-background/90"
        >
          {isPdf ? 'PDF' : 'Imagem'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Candidate Name */}
        <h3 className="font-semibold text-lg truncate" title={curriculo.candidate_name}>
          {curriculo.candidate_name}
        </h3>

        {/* Job Position Badges */}
        <div className="flex flex-wrap gap-1">
          {curriculo.job_position.map((position) => (
            <Badge 
              key={position}
              variant="outline" 
              className={cn(
                'text-xs',
                jobPositionColors[position as JobPosition]
              )}
            >
              {jobPositionLabels[position as JobPosition]}
            </Badge>
          ))}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(curriculo.created_at)}</span>
          {curriculo.file_size && (
            <>
              <span>•</span>
              <span>{formatFileSize(curriculo.file_size)}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(curriculo)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
          
          <a
            href={curriculo.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-1" />
              Baixar
            </Button>
          </a>
          
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(curriculo)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
