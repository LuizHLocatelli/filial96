
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DirectoryCategory } from "../types";

interface CategoryFilterProps {
  selectedCategoryId: string | undefined;
  handleClearCategory: () => void;
  categories: DirectoryCategory[];
}

export function CategoryFilter({
  selectedCategoryId,
  handleClearCategory,
  categories,
}: CategoryFilterProps) {
  if (!selectedCategoryId) return null;

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );

  if (!selectedCategory) return null;

  return (
    <div className="flex items-center">
      <Badge variant="outline" className="text-xs py-1">
        {selectedCategory.name}
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 ml-1 hover:bg-transparent"
          onClick={handleClearCategory}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Limpar filtro</span>
        </Button>
      </Badge>
    </div>
  );
}
