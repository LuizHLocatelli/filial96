
import { FileUploader } from './FileUploader';
import { Button } from '@/components/ui/button';
import { DirectoryCategory } from '../types';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      {/* Upload de arquivo */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de arquivo</CardTitle>
          <CardDescription>
            Faça upload de arquivos para o diretório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader 
            categories={categories}
            onUpload={onUpload}
            isUploading={isUploading}
            progress={progress}
          />
        </CardContent>
      </Card>
      
      {/* Gerenciamento de categorias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>
              Gerencie as categorias do diretório
            </CardDescription>
          </div>
          <Button 
            size="sm"
            onClick={() => setCategoryDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova
          </Button>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
