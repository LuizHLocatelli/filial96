
import React from 'react';

export function LoadingIndicator() {
  return (
    <div className="text-center py-8">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
      <p className="mt-2 text-sm text-muted-foreground">Carregando arquivos...</p>
    </div>
  );
}
