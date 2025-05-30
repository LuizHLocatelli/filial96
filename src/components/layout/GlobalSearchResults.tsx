import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Sofa, 
  FileText, 
  FolderArchive, 
  ShoppingCart, 
  Star, 
  CheckSquare, 
  Calendar, 
  CreditCard, 
  Landmark, 
  Image, 
  User,
  ArrowRight,
  Clock,
  Activity,
  Zap,
  Users,
  Coffee,
  Shield,
  BarChart3
} from "lucide-react";

const iconMap = {
  LayoutDashboard,
  Sofa,
  FileText,
  FolderArchive,
  ShoppingCart,
  Star,
  CheckSquare,
  Calendar,
  CreditCard,
  Landmark,
  Image,
  User,
  Activity,
  Zap,
  Users,
  Coffee,
  Shield,
  BarChart3,
  Clock
} as any;

interface GlobalSearchResultsProps {
  onResultClick?: () => void;
}

export function GlobalSearchResults({ onResultClick }: GlobalSearchResultsProps) {
  const { searchResults, isSearching, searchTerm, clearSearch } = useGlobalSearch();
  const navigate = useNavigate();

  const handleResultClick = (path: string) => {
    navigate(path);
    clearSearch();
    onResultClick?.();
  };

  if (!searchTerm) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
      {isSearching ? (
        <div className="p-4 text-center text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin mx-auto mb-2" />
          Pesquisando...
        </div>
      ) : searchResults.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          <p className="font-medium mb-1">Nenhum resultado encontrado</p>
          <p className="text-sm">Tente pesquisar com outros termos</p>
        </div>
      ) : (
        <div className="p-2">
          <div className="text-xs text-muted-foreground px-2 py-1 mb-2">
            {searchResults.length} resultado(s) encontrado(s)
          </div>
          {searchResults.map((result) => {
            const IconComponent = iconMap[result.icon as keyof typeof iconMap];
            
            return (
              <Button
                key={result.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3 mb-1 text-left"
                onClick={() => handleResultClick(result.path)}
              >
                <div className="flex items-start gap-3 w-full">
                  {IconComponent && (
                    <IconComponent className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {result.title}
                      </span>
                      {result.section && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {result.section}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
} 