import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { DirectoryFile, SortOption, SortDirection } from '@/components/crediario/diretorio/types';
import { supabase } from '@/integrations/supabase/client';

export function useFileOperations(tableName: string, files: DirectoryFile[], refetch: () => void) {
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

  const handleFileUpload = async (files: FileList | File[], categoryId?: string) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      try {
        // Upload para o storage
        const fileName = `${Date.now()}_${file.name}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from('moda_arquivos')
          .upload(fileName, file);

        if (storageError) throw storageError;

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('moda_arquivos')
          .getPublicUrl(fileName);

        // Inserir no banco
        const { error: dbError } = await supabase
          .from('moda_arquivos')
          .insert([{
            name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            category_id: categoryId || null
          }]);

        if (dbError) throw dbError;
      } catch (error) {
        console.error('Erro no upload:', error);
        throw error;
      }
    }
    
    refetch();
  };

  const handleUpdateFile = async (id: string, name: string, description?: string, categoryId?: string) => {
    const { error } = await supabase
      .from('moda_arquivos')
      .update({ name, description, category_id: categoryId })
      .eq('id', id);

    if (error) throw error;
    
    refetch();
  };

  const handleDeleteFileConfirm = async () => {
    if (!selectedFile) return;

    try {
      // Excluir do banco
      const { error: dbError } = await supabase
        .from('moda_arquivos')
        .delete()
        .eq('id', selectedFile.id);

      if (dbError) throw dbError;

      // Tentar excluir do storage
      if (selectedFile.file_url) {
        try {
          const fileName = selectedFile.file_url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('moda_arquivos')
              .remove([fileName]);
          }
        } catch (storageError) {
          console.error('Erro ao excluir do storage:', storageError);
        }
      }

      setSelectedFile(null);
      setDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      throw error;
    }
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
    handleFileUpload,
    handleUpdateFile,
    handleDeleteFileConfirm,
    setFileDialogOpen,
    setDeleteDialogOpen,
    setViewerOpen
  };
}
