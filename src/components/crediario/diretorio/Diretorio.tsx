
import { useState } from 'react';
import { useDirectoryCategories } from './hooks/useDirectoryCategories';
import { useDirectoryFiles } from './hooks/useDirectoryFiles';
import { FileGrid } from './components/FileGrid';
import { FileList } from './components/FileList';
import { FileUploader } from './components/FileUploader';
import { CategoryDialog } from './components/CategoryDialog';
import { FileDialog } from './components/FileDialog';
import { DeleteFileDialog } from './components/DeleteFileDialog';
import { FileViewer } from './components/FileViewer';
import { DirectoryFile, DirectoryCategory, FileViewMode, SortOption, SortDirection } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Grid,
  List,
  LayoutGrid,
  Plus,
  FolderPlus,
  Search,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Diretorio() {
  // Estados para os recursos do diretório
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<FileViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Estados para diálogos
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory | null>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DirectoryFile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  // Hooks para dados
  const { 
    categories, 
    isLoading: categoriesLoading, 
    addCategory, 
    updateCategory,
    deleteCategory 
  } = useDirectoryCategories();
  
  const { 
    files, 
    isLoading: filesLoading, 
    isUploading,
    uploadFile, 
    updateFile, 
    deleteFile,
    fetchFiles
  } = useDirectoryFiles(selectedCategoryId);
  
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
        return direction * (a.file_size - b.file_size);
      case 'type':
        return direction * a.file_type.localeCompare(b.file_type);
      case 'date':
      default:
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
  });

  // Manipuladores de eventos
  const handleAddCategory = async (name: string, description: string) => {
    await addCategory(name, description || undefined);
  };

  const handleUpdateCategory = async (name: string, description: string) => {
    if (!selectedCategory) return;
    await updateCategory(selectedCategory.id, { name, description: description || undefined });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(undefined);
    }
    await deleteCategory(categoryId);
  };

  const handleEditCategory = (category: DirectoryCategory) => {
    setSelectedCategory(category);
    setEditCategoryDialogOpen(true);
  };
  
  const handleFileUpload = async (file: File, options: { 
    name?: string; 
    description?: string; 
    categoryId?: string; 
    isFeatured?: boolean;
  }) => {
    return uploadFile(file, options);
  };

  const handleUpdateFile = async (updates: {
    name: string;
    description: string;
    category_id: string | null;
    is_featured: boolean;
  }) => {
    if (!selectedFile) return;
    await updateFile(selectedFile.id, updates);
  };

  const handleDeleteFileConfirm = async () => {
    if (!selectedFile) return;
    await deleteFile(selectedFile.id, selectedFile.file_url);
  };

  const handleViewFile = (file: DirectoryFile) => {
    setSelectedFile(file);
    setViewerOpen(true);
  };

  const handleEditFile = (file: DirectoryFile) => {
    setSelectedFile(file);
    setFileDialogOpen(true);
  };

  const handleDeleteFile = (file: DirectoryFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handleClearCategory = () => {
    setSelectedCategoryId(undefined);
  };

  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      // Se já estiver ordenando por esta opção, alternar a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const isLoading = categoriesLoading || filesLoading;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Diretório de Arquivos</h2>
        <p className="text-muted-foreground text-sm">
          Organize e acesse documentos importantes para o setor
        </p>
      </div>
      
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="browse">Arquivos</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="mt-4">
          <div className="space-y-4">
            {/* Barra de ferramentas */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex gap-2 items-center">
                {/* Menu de categorias */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <FolderPlus className="h-4 w-4 mr-2" />
                      <span>Categorias</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => setCategoryDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Nova categoria</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {categories.length === 0 ? (
                      <div className="text-center py-2 text-sm text-muted-foreground">
                        Nenhuma categoria
                      </div>
                    ) : (
                      categories.map((category) => (
                        <DropdownMenuItem key={category.id} className="justify-between">
                          <span 
                            className="cursor-pointer truncate max-w-[180px]"
                            onClick={() => setSelectedCategoryId(category.id)}
                          >
                            {category.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                          >
                            <span className="sr-only">Editar</span>
                            ⋮
                          </Button>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Botões de visualização */}
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-none h-9 w-9"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-none h-9 w-9"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Botão de ordenação */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                      <span>Ordenar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleSortChange('date')}>
                      {sortBy === 'date' && (
                        <span className="mr-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                      Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('name')}>
                      {sortBy === 'name' && (
                        <span className="mr-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                      Nome
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('type')}>
                      {sortBy === 'type' && (
                        <span className="mr-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                      Tipo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('size')}>
                      {sortBy === 'size' && (
                        <span className="mr-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                      Tamanho
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Barra de pesquisa */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar arquivos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro de categoria ativo */}
            {selectedCategoryId && (
              <div>
                <Badge 
                  variant="outline" 
                  className="flex items-center gap-1"
                >
                  Categoria: {categories.find(c => c.id === selectedCategoryId)?.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={handleClearCategory}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </div>
            )}

            <Separator />

            {/* Exibição de arquivos */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando arquivos...</p>
              </div>
            ) : (
              viewMode === 'grid' ? (
                <FileGrid
                  files={sortedFiles}
                  onViewFile={handleViewFile}
                  onDeleteFile={handleDeleteFile}
                  onEditFile={handleEditFile}
                />
              ) : (
                <FileList
                  files={sortedFiles}
                  onViewFile={handleViewFile}
                  onDeleteFile={handleDeleteFile}
                  onEditFile={handleEditFile}
                />
              )
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="mt-4">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_250px]">
              {/* Upload de arquivo */}
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Upload de arquivo</h3>
                <FileUploader 
                  categories={categories}
                  onUpload={handleFileUpload}
                  isUploading={isUploading}
                />
              </div>
              
              {/* Gerenciamento de categorias */}
              <div className="p-6 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Categorias</h3>
                  <Button 
                    size="sm"
                    onClick={() => setCategoryDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nova
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma categoria criada
                    </p>
                  ) : (
                    categories.map((category) => (
                      <div 
                        key={category.id}
                        className="flex justify-between items-center p-2 rounded hover:bg-muted/50"
                      >
                        <div className="truncate max-w-[150px]">
                          <span>{category.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          Editar
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSave={handleAddCategory}
        title="Nova Categoria"
      />

      <CategoryDialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
        onSave={handleUpdateCategory}
        category={selectedCategory || undefined}
        title="Editar Categoria"
      />

      {selectedFile && (
        <FileDialog
          open={fileDialogOpen}
          onOpenChange={setFileDialogOpen}
          onSave={handleUpdateFile}
          file={selectedFile}
          categories={categories}
        />
      )}

      <DeleteFileDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteFileConfirm}
        file={selectedFile}
      />

      <FileViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        file={selectedFile}
      />
    </div>
  );
}
