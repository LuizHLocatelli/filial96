
import React from 'react';
import { FileText, File, FileImage, Download, MoreHorizontal, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DirectoryFile } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FileListProps {
  files: DirectoryFile[];
  onViewFile: (file: DirectoryFile) => void;
  onDeleteFile: (file: DirectoryFile) => void;
  onEditFile: (file: DirectoryFile) => void;
}

export function FileList({ files, onViewFile, onDeleteFile, onEditFile }: FileListProps) {
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
      return <FileImage className="h-5 w-5 text-purple-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Tamanho</TableHead>
            <TableHead className="hidden md:table-cell">Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <div 
                  className="flex items-center space-x-3 cursor-pointer" 
                  onClick={() => onViewFile(file)}
                >
                  {getFileIcon(file.file_type)}
                  <div>
                    <div className="font-medium">
                      {file.name}
                      {file.is_featured && (
                        <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                          Destaque
                        </Badge>
                      )}
                    </div>
                    {file.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {file.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {file.file_type.split('/').pop()?.toUpperCase()}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatFileSize(file.file_size)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {format(new Date(file.created_at), 'dd/MM/yy', { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center space-x-1">
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
                      <DropdownMenuItem onClick={() => onViewFile(file)}>
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Visualizar</span>
                      </DropdownMenuItem>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
