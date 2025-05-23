
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '../button';

interface PDFEmptyStateProps {
  onOpenExternal: () => void;
}

export function PDFEmptyState({ onOpenExternal }: PDFEmptyStateProps) {
  return (
    <div className="text-center p-8">
      <p className="text-sm text-muted-foreground">
        Nenhuma página encontrada no PDF.
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onOpenExternal}
        className="mt-4"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Abrir PDF externamente
      </Button>
    </div>
  );
}
