/**
 * Hook compartilhado para operações do Diretório
 * Usando tabelas crediario_directory_* que existem no banco
 */

import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import {
  DirectoryFile,
  DirectoryCategory,
  UseDirectoryConfig,
} from "@/types/shared/directory";

export function useDirectory(config: UseDirectoryConfig) {
  const { toast } = useToast();
  const { user } = useAuth();

  // States
  const [files, setFiles] = useState<DirectoryFile[]>([]);
  const [categories, setCategories] = useState<DirectoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory | null>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DirectoryFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("crediario_directory_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories((data || []) as unknown as DirectoryCategory[]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("crediario_directory_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles((data || []) as unknown as DirectoryFile[]);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  const refresh = useCallback(async () => {
    await Promise.all([fetchCategories(), fetchFiles()]);
  }, [fetchCategories, fetchFiles]);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        const matchesSearch =
          searchQuery === "" ||
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategoryId === null || file.category_id === selectedCategoryId;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "date":
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case "size":
            comparison = a.file_size - b.file_size;
            break;
          case "type":
            comparison = a.file_type.localeCompare(b.file_type);
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [files, searchQuery, selectedCategoryId, sortBy, sortDirection]);

  // Category operations
  const handleAddCategory = async (name: string, description: string) => {
    try {
      const { error } = await supabase
        .from("crediario_directory_categories")
        .insert([{ name, description, created_by: user?.id }]);

      if (error) throw error;
      await fetchCategories();
      setCategoryDialogOpen(false);
      toast({ title: "Sucesso", description: "Categoria adicionada com sucesso." });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (name: string, description: string) => {
    if (!selectedCategory) return;
    try {
      const { error } = await supabase
        .from("crediario_directory_categories")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", selectedCategory.id);

      if (error) throw error;
      await fetchCategories();
      setEditCategoryDialogOpen(false);
      toast({ title: "Sucesso", description: "Categoria atualizada com sucesso." });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: DirectoryCategory) => {
    setSelectedCategory(category);
    setEditCategoryDialogOpen(true);
  };

  const handleClearCategory = () => {
    setSelectedCategoryId(null);
  };

  // File operations
  const handleViewFile = (file: DirectoryFile) => {
    setSelectedFile(file);
    setViewerOpen(true);
  };

  const handleDeleteFile = (file: DirectoryFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handleEditFile = (file: DirectoryFile) => {
    setSelectedFile(file);
    setFileDialogOpen(true);
  };

  const handleDeleteFileConfirm = async () => {
    if (!selectedFile) return;
    try {
      // Delete file from storage
      const filePath = selectedFile.file_url.split("/").pop();
      if (filePath) {
        await supabase.storage.from("directory").remove([`${config.sector}/${filePath}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from("crediario_directory_files")
        .delete()
        .eq("id", selectedFile.id);
      if (error) throw error;

      await fetchFiles();
      setDeleteDialogOpen(false);
      setSelectedFile(null);
      toast({ title: "Sucesso", description: "Arquivo excluído com sucesso." });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFile = async (updates: {
    name: string;
    description: string;
    category_id: string | null;
    is_featured: boolean;
  }) => {
    if (!selectedFile) return;
    try {
      const { error } = await supabase
        .from("crediario_directory_files")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", selectedFile.id);

      if (error) throw error;
      await fetchFiles();
      setFileDialogOpen(false);
      toast({ title: "Sucesso", description: "Arquivo atualizado com sucesso." });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleSortChange = (by: "name" | "date" | "size" | "type") => {
    if (sortBy === by) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(by);
      setSortDirection("desc");
    }
  };

  // File upload
  const handleFileUpload = async (file: File, categoryId: string | null) => {
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = `${config.sector}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("directory").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("directory").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("crediario_directory_files").insert([
        {
          name: file.name,
          category_id: categoryId,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          created_by: user?.id,
        },
      ]);

      if (dbError) throw dbError;

      await fetchFiles();
      toast({ title: "Sucesso", description: "Arquivo enviado com sucesso." });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Return
  return {
    // Data
    files,
    categories,
    isLoading,
    refresh,

    // Search and filter
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    filteredFiles,

    // Sorting
    sortBy,
    sortDirection,
    handleSortChange,

    // Category operations
    categoryProps: {
      categories,
      selectedCategoryId,
      setSelectedCategoryId,
      categoryDialogOpen,
      setCategoryDialogOpen,
      editCategoryDialogOpen,
      setEditCategoryDialogOpen,
      selectedCategory,
      handleAddCategory,
      handleUpdateCategory,
      handleEditCategory,
      handleClearCategory,
    },

    // File operations
    fileProps: {
      searchQuery,
      setSearchQuery,
      sortBy,
      sortDirection,
      handleSortChange,
      sortedFiles: filteredFiles,
      handleViewFile,
      handleDeleteFile,
      handleEditFile,
      fileDialogOpen,
      setFileDialogOpen,
      deleteDialogOpen,
      setDeleteDialogOpen,
      viewerOpen,
      setViewerOpen,
      selectedFile,
      setSelectedFile,
    },

    // Upload
    isUploading,
    handleFileUpload,

    // Dialogs
    categoryDialogOpen,
    setCategoryDialogOpen,
    editCategoryDialogOpen,
    setEditCategoryDialogOpen,
    selectedCategory,
    fileDialogOpen,
    setFileDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    viewerOpen,
    setViewerOpen,
    selectedFile,
  };
}
