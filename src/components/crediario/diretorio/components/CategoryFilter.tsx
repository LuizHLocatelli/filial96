
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { DirectoryCategory } from '../types';

interface CategoryFilterProps {
  selectedCategoryId: string | undefined;
  handleClearCategory: () => void;
  categories: DirectoryCategory[];
}

export function CategoryFilter({ 
  selectedCategoryId, 
  handleClearCategory,
  categories
}: CategoryFilterProps) {
  if (!selectedCategoryId) return null;
  
  const categoryName = categories.find(c => c.id === selectedCategoryId)?.name;
  
  return (
    <div>
      <Badge variant="outline" className="flex items-center gap-1">
        Categoria: {categoryName}
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
  );
}
