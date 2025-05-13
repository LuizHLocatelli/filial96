
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CardGalleryEmptyProps {
  folderId: string | null;
}

export function CardGalleryEmpty({ folderId }: CardGalleryEmptyProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col items-center justify-center bg-muted/50 border border-dashed border-muted-foreground/20 rounded-lg p-4 sm:p-6 text-center">
      <h3 className={cn("font-medium", isMobile ? "text-sm" : "text-base")}>
        {folderId ? "Nenhum card nesta pasta" : "Nenhum card encontrado"}
      </h3>
      <p className={cn("text-muted-foreground mt-1 mb-4", isMobile ? "text-xs" : "text-sm")}>
        Adicione cards promocionais para exibir aqui.
      </p>
      
      <Button size={isMobile ? "sm" : "default"} className={cn(isMobile && "text-xs")}>
        <Plus className={cn("mr-2", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
        Adicionar card
      </Button>
    </div>
  );
}
