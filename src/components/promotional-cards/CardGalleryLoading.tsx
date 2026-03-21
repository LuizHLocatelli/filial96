import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function CardGalleryLoading() {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-11 w-full bg-gradient-to-r from-muted to-muted/50 rounded-xl" />
        <Skeleton className="h-4 w-32 bg-muted/70 rounded" />
      </div>
      
      <div className={cn(
        "grid gap-3 sm:gap-4",
        isMobile 
          ? "grid-cols-2" 
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      )}>
        {Array.from({ length: isMobile ? 6 : 12 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card className="overflow-hidden border-border/50 bg-card">
              <div className="aspect-[4/5] relative">
                <Skeleton className="w-full h-full bg-gradient-to-br from-muted via-muted/70 to-muted/50 animate-pulse rounded-none" />
              </div>
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-muted/70 rounded" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-1/2 bg-muted/50 rounded" />
                  <Skeleton className="h-8 w-8 rounded-full bg-muted/60" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
