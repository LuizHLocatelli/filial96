
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sofa, Shirt, Wallet, Wrench } from "lucide-react";

interface SectorSelectorProps {
  selectedSector: "furniture" | "fashion" | "loan" | "service";
  onSectorChange: (sector: string) => void;
}

export function SectorSelector({ selectedSector, onSectorChange }: SectorSelectorProps) {
  const isMobile = useIsMobile();
  
  const sectors = [
    { title: "Móveis", value: "furniture", icon: Sofa },
    { title: "Moda", value: "fashion", icon: Shirt },
    { title: "Empréstimo", value: "loan", icon: Wallet },
    { title: "Serviços", value: "service", icon: Wrench },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {sectors.map(sector => (
        <Card
          key={sector.value}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedSector === sector.value 
              ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10 border-primary/30' 
              : 'hover:bg-accent/50 border-border/50'
          )}
          onClick={() => onSectorChange(sector.value)}
        >
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
              <div className={cn(
                "p-1.5 sm:p-2 rounded-lg transition-colors",
                selectedSector === sector.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              )}>
                <sector.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className={cn(
                  "font-medium text-xs sm:text-sm truncate",
                  selectedSector === sector.value && "text-primary"
                )}>
                  {sector.title}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
