
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function CardGalleryLoading() {
  const isMobile = useIsMobile();
  const items = isMobile ? 4 : 8;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-card border rounded-md animate-pulse flex flex-col">
          <div className="aspect-[3/2] bg-muted rounded-md m-2 sm:m-3" />
          <div className="h-4 bg-muted rounded m-2 mt-0 sm:m-3 sm:mt-0 w-2/3" />
        </div>
      ))}
    </div>
  );
}
