import React from 'react';

interface DirectoryHeaderProps {
  title?: string;
  description?: string;
  sector?: string;
}

export function DirectoryHeader({ 
  title = "Diretório de Arquivos", 
  description,
  sector = "setor"
}: DirectoryHeaderProps) {
  const defaultDescription = description || `Organize e acesse documentos importantes para o ${sector}`;
  
  return (
    <div className="text-center space-y-2 pb-2">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
        {defaultDescription}
      </p>
    </div>
  );
}
