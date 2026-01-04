import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  Search,
  RotateCw,
  Maximize,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFToolbarProps {
  numPages: number;
  currentPage: number;
  scale: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onDownload: () => void;
  onPrint: () => void;
  onSearch: () => void;
  onRotate: () => void;
  onFitToWidth: () => void;
  className?: string;
}

export function PDFToolbar({
  numPages,
  currentPage,
  scale,
  isLoading,
  onPageChange,
  onScaleChange,
  onDownload,
  onPrint,
  onSearch,
  onRotate,
  onFitToWidth,
  className,
}: PDFToolbarProps) {
  const [pageInput, setPageInput] = React.useState(String(currentPage));

  React.useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (page >= 1 && page <= numPages) {
      onPageChange(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.25, 5));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.25, 0.5));
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-2 border-b bg-background',
        className
      )}
    >
      {/* Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
          <Input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            className="w-16 text-center"
            disabled={isLoading}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            / {numPages}
          </span>
        </form>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(currentPage + 1, numPages))}
          disabled={currentPage >= numPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={scale <= 0.5 || isLoading}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={scale >= 5 || isLoading}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onFitToWidth}
          disabled={isLoading}
          title="Ajustar à largura"
        >
          <Maximize className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onRotate}
          disabled={isLoading}
          title="Girar"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onSearch}
          disabled={isLoading}
          title="Buscar texto"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onDownload}
          disabled={isLoading}
          title="Baixar"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onPrint}
          disabled={isLoading}
          title="Imprimir"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
