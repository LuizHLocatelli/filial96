
import { Skeleton } from "@/components/ui/skeleton";

export function BoardLoading() {
  // Create an array to generate multiple column skeletons
  const columnCount = 3;
  const skeletonColumns = Array.from({ length: columnCount }, (_, i) => i);
  
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28 hidden md:block" />
          <Skeleton className="h-9 w-28 hidden md:block" />
        </div>
      </div>
      
      {/* Board columns skeleton */}
      <div className="flex flex-col md:flex-row gap-4 pb-4 overflow-x-auto min-h-[calc(100vh-250px)]">
        {skeletonColumns.map((index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-full md:w-80 mb-6 md:mb-0"
          >
            <div className="border dark:border-gray-700 rounded-md shadow-sm h-[65vh] flex flex-col">
              {/* Column header */}
              <div className="p-3 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              </div>
              
              {/* Column cards */}
              <div className="p-2 flex-1 space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton 
                    key={i} 
                    className="h-24 w-full rounded-md"
                  />
                ))}
              </div>
              
              {/* Add button */}
              <div className="p-2">
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
