import { Separator } from '@/components/ui/separator';
import { DirectoryToolbar } from '@/components/crediario/diretorio/components/DirectoryToolbar';
import { CategoryFilter } from '@/components/crediario/diretorio/components/CategoryFilter';
import { FileGrid } from '@/components/crediario/diretorio/components/FileGrid';
import { FileList } from '@/components/crediario/diretorio/components/FileList';
import { LoadingIndicator } from '@/components/crediario/diretorio/components/LoadingIndicator';
import { DirectoryCategory, DirectoryFile, FileViewMode, SortOption, SortDirection } from '@/components/crediario/diretorio/types';

interface FileDisplaySectionProps {
  viewMode: FileViewMode;
  setViewMode: (mode: FileViewMode) => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  handleSortChange: (option: SortOption) => void;
  setCategoryDialogOpen: (open: boolean) => void;
  categories: DirectoryCategory[];
  setSelectedCategoryId: (id: string | undefined) => void;
  handleEditCategory: (category: DirectoryCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryId: string | undefined;
  handleClearCategory: () => void;
  isLoading: boolean;
  sortedFiles: DirectoryFile[];
  onViewFile: (file: DirectoryFile) => void;
  onDeleteFile: (file: DirectoryFile) => void;
  onEditFile: (file: DirectoryFile) => void;
}

export function FileDisplaySection({
  viewMode,
  setViewMode,
  sortBy,
  sortDirection,
  handleSortChange,
  setCategoryDialogOpen,
  categories,
  setSelectedCategoryId,
  handleEditCategory,
  searchQuery,
  setSearchQuery,
  selectedCategoryId,
  handleClearCategory,
  isLoading,
  sortedFiles,
  onViewFile,
  onDeleteFile,
  onEditFile,
}: FileDisplaySectionProps) {
  return (
    <div className="md:col-span-2 space-y-4">
      {/* Barra de ferramentas */}
      <DirectoryToolbar 
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        sortDirection={sortDirection}
        handleSortChange={handleSortChange}
        setCategoryDialogOpen={setCategoryDialogOpen}
        categories={categories}
        setSelectedCategoryId={setSelectedCategoryId}
        handleEditCategory={handleEditCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Filtro de categoria ativo */}
      <CategoryFilter 
        selectedCategoryId={selectedCategoryId}
        handleClearCategory={handleClearCategory}
        categories={categories}
      />

      <Separator />

      {/* Exibição de arquivos */}
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        viewMode === 'grid' ? (
          <FileGrid
            files={sortedFiles}
            onViewFile={onViewFile}
            onDeleteFile={onDeleteFile}
            onEditFile={onEditFile}
          />
        ) : (
          <FileList
            files={sortedFiles}
            onViewFile={onViewFile}
            onDeleteFile={onDeleteFile}
            onEditFile={onEditFile}
          />
        )
      )}
    </div>
  );
} 