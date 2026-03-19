import { memo } from "react";
import { ChevronRight, Home, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem } from "../types";

interface BreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (pastaId: string | null) => void;
}

export const Breadcrumb = memo(function Breadcrumb({
  path,
  onNavigate,
}: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4 overflow-x-auto">
      {path.map((item, index) => (
        <div key={item.id || "root"} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
          )}
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 flex items-center space-x-1 ${
              index === path.length - 1
                ? "text-foreground font-medium"
                : "hover:text-foreground"
            }`}
            onClick={() => onNavigate(item.id)}
          >
            {index === 0 ? (
              <>
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{item.nome}</span>
              </>
            ) : (
              <>
                <Folder className="h-4 w-4 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {item.nome}
                </span>
              </>
            )}
          </Button>
        </div>
      ))}
    </nav>
  );
});
