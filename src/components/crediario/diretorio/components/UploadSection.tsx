
import { FileUploader } from './FileUploader';
import { Button } from '@/components/ui/button';
import { DirectoryCategory } from '../types';
import { Plus } from 'lucide-react';

interface UploadSectionProps {
  categories: DirectoryCategory[];
  onUpload: (file: File, options: { 
    name?: string; 
    description?: string; 
    categoryId?: string; 
    isFeatured?: boolean;
  }) => Promise<any>;
  isUploading: boolean;
  progress?: number;
  setCategoryDialogOpen: (open: boolean) => void;
  handleEditCategory: (category: DirectoryCategory) => void;
}

export function UploadSection({ 
  categories, 
  onUpload, 
  isUploading, 
  progress = 0,
  setCategoryDialogOpen,
  handleEditCategory
}: UploadSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px]">
      {/* Upload de arquivo */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-medium mb-4">Upload de arquivo</h3>
        <FileUploader 
          categories={categories}
          onUpload={onUpload}
          isUploading={isUploading}
          progress={progress}
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
  );
}
