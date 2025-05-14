
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  List,
  LayoutGrid,
  Plus,
  FolderPlus,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { DirectoryCategory, FileViewMode, SortOption, SortDirection } from '../types';

interface DirectoryToolbarProps {
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
}

export function DirectoryToolbar({
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
  setSearchQuery
}: DirectoryToolbarProps) {
  return (
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
  );
}
