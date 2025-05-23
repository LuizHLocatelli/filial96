
import React from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../button';

interface PDFLoadingStateProps {
  className?: string;
  loadAttempts: number;
  onOpenExternal: () => void;
}

export function PDFLoadingState({ className, loadAttempts, onOpenExternal }: PDFLoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center p-8 min-h-[400px] bg-muted/20 rounded-lg", className)}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando PDF...</p>
        {loadAttempts > 0 && (
          <p className="text-xs text-muted-foreground">
            Tentativa {loadAttempts + 1} de 3
          </p>
        )}
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Se o carregamento demorar muito, você pode tentar abrir o PDF externamente.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenExternal}
          className="mt-2"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir em nova aba
        </Button>
      </div>
    </div>
  );
}
