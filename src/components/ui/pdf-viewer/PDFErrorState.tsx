
import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../button';

interface PDFErrorStateProps {
  className?: string;
  error: string;
  url: string;
  onOpenExternal: () => void;
}

export function PDFErrorState({ className, error, url, onOpenExternal }: PDFErrorStateProps) {
  return (
    <div className={cn("flex items-center justify-center p-8 min-h-[400px] bg-muted/10 rounded-lg", className)}>
      <div className="flex flex-col items-center gap-3 text-center max-w-md">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive mb-2">Erro ao carregar PDF</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2 break-all">
            URL: {url}
          </p>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          onClick={onOpenExternal}
          className="mt-2"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Tentar abrir externamente
        </Button>
      </div>
    </div>
  );
}
