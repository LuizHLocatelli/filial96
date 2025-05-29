import { useIsMobile } from "@/hooks/use-mobile";

export function OrientacoesLoadingSkeleton() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded-lg w-1/3" />
        <div className="flex gap-2">
          <div className="h-10 bg-muted animate-pulse rounded-lg flex-1" />
          <div className="h-10 bg-muted animate-pulse rounded-lg w-32" />
        </div>
      </div>
      
      {/* Cards Skeleton */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
