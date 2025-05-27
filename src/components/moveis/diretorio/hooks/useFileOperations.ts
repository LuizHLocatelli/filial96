import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { DirectoryFile, DirectoryCategory, SortDirection, SortOption } from '../types';

export function useFileOperations(files: DirectoryFile[], categories: DirectoryCategory[]) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedFile, setSelectedFile] = useState<DirectoryFile | null>(null);
  
  // Diálogos
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Filtrar e ordenar arquivos
  const filteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      file.name.toLowerCase().includes(query) || 
      (file.description && file.description.toLowerCase().includes(query))
    );
  });
  
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'size':
        // Tratar arquivos sem tamanho definido
        if (a.file_size === null && b.file_size === null) return 0;
        if (a.file_size === null) return direction;
        if (b.file_size === null) return -direction;
        return direction * ((a.file_size || 0) - (b.file_size || 0));
      case 'type':
        return direction * a.file_type.localeCompare(b.file_type);
      case 'date':
      default:
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
  });

  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      // Se já estiver ordenando por esta opção, alternar a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const handleViewFile = (file: DirectoryFile) => {
    if (file.file_type.includes("pdf")) {
      const params = new URLSearchParams();
      params.append("url", file.file_url);
      if (file.name) { 
        params.append("name", file.name);
      }
      navigate(`/pdf-viewer?${params.toString()}`);
    } else {
      setSelectedFile(file);
      setViewerOpen(true);
    }
  };

  const handleEditFile = (file: DirectoryFile) => {
    setSelectedFile(file);
    setFileDialogOpen(true);
  };

  const handleDeleteFile = (file: DirectoryFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  return {
    // Estado
    searchQuery,
    setSearchQuery,
    sortBy,
    sortDirection,
    selectedFile,
    fileDialogOpen,
    deleteDialogOpen,
    viewerOpen,
    sortedFiles,
    
    // Funções
    handleSortChange,
    handleViewFile,
    handleEditFile,
    handleDeleteFile,
    setFileDialogOpen,
    setDeleteDialogOpen,
    setViewerOpen
  };
}
