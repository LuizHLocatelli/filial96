
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListSkeletonProps {
  count?: number;
  className?: string;
}

export function TaskListSkeleton({ count = 3, className = "" }: TaskListSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="border rounded-md p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-full" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
