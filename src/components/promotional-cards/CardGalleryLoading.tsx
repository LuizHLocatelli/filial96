
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function CardGalleryLoading() {
  return (
    <div className="space-y-6">
      {/* Skeleton da barra de pesquisa */}
      <div className="space-y-2">
        <Skeleton className="h-11 w-full bg-gradient-to-r from-muted to-muted/50" />
        <Skeleton className="h-4 w-48 bg-muted/70" />
      </div>
      
      {/* Grid de skeletons dos cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border-border/50">
            <CardContent className="p-0">
              <AspectRatio ratio={4/5}>
                <Skeleton className="w-full h-full bg-gradient-to-br from-muted via-muted/70 to-muted/50 animate-pulse" />
              </AspectRatio>
            </CardContent>
            <CardFooter className="p-3 space-y-2">
              <div className="flex justify-between items-center w-full">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-muted/70" />
                  <Skeleton className="h-3 w-1/2 bg-muted/50" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full bg-muted/60" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
