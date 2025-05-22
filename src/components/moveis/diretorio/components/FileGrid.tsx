
import React from 'react';
import { FileText, File, FileImage, Download, MoreHorizontal, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DirectoryFile } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FileGridProps {
  files: DirectoryFile[];
  onViewFile: (file: DirectoryFile) => void;
  onDeleteFile: (file: DirectoryFile) => void;
  onEditFile: (file: DirectoryFile) => void;
}

export function FileGrid({ files, onViewFile, onDeleteFile, onEditFile }: FileGridProps) {
  // Função para formatar o tamanho do arquivo
  const formatFileSize = (size: number | undefined) => {
    if (!size) return 'Desconhecido';
    
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Função para obter o ícone adequado para o tipo de arquivo
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <FileImage className="h-12 w-12 text-purple-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-12 w-12 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-12 w-12 text-blue-500" />;
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileText className="h-12 w-12 text-green-500" />;
    } else {
      return <File className="h-12 w-12 text-gray-500" />;
    }
  };

  // Se não houver arquivos
  if (files.length === 0) {
    return (
      <div className="text-center py-10">
        <File className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum arquivo</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece fazendo upload de um arquivo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.id} className={file.is_featured ? 'border-primary' : ''}>
          <CardContent className="p-4">
            <div 
              className="flex flex-col items-center justify-center h-32 mb-3 cursor-pointer" 
              onClick={() => onViewFile(file)}
            >
              {getFileIcon(file.file_type)}
              <h3 className="mt-2 text-sm font-medium text-center line-clamp-2">
                {file.name}
              </h3>
            </div>
            
            {file.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {file.description}
              </p>
            )}
            
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tamanho:</span>
                <span>{formatFileSize(file.file_size)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Data:</span>
                <span>{format(new Date(file.created_at), 'dd/MM/yy', { locale: ptBR })}</span>
              </div>
            </div>
            
            {file.is_featured && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">Destacado</Badge>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-2 pt-0">
            <div className="flex justify-between w-full">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewFile(file)}
              >
                Visualizar
              </Button>
              
              <div className="flex">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-muted-foreground"
                >
                  <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditFile(file)}>
                      <Edit className="h-4 w-4 mr-2" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteFile(file)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
