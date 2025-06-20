import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sofa, Shirt, Wallet, Settings } from "lucide-react";

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
    { title: "Geral e Serviços", value: "service", icon: Settings },
  ];
  
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4">
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-4"
        )}>
          {sectors.map((sector) => (
            <button
              key={sector.value}
              onClick={() => onSectorChange(sector.value)}
              className={cn(
                "group relative flex items-center justify-center gap-3 rounded-lg transition-all duration-200 border-2",
                isMobile ? "h-20 flex-col p-3" : "h-16 flex-row p-4",
                selectedSector === sector.value
                  ? "btn-primary-standard shadow-md"
                  : "bg-background hover:bg-muted border-border hover:border-border/80 hover:shadow-sm"
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-md transition-all duration-200",
                isMobile ? "w-8 h-8" : "w-6 h-6",
                selectedSector === sector.value
                  ? "bg-primary-foreground/20"
                  : "bg-muted"
              )}>
                <sector.icon className={cn(
                  "transition-all duration-200",
                  isMobile ? "h-5 w-5" : "h-4 w-4",
                  selectedSector === sector.value 
                    ? "text-primary-foreground" 
                    : "text-foreground"
                )} />
              </div>
              <span className={cn(
                "font-medium transition-all duration-200 text-center",
                isMobile ? "text-xs leading-tight" : "text-sm",
                selectedSector === sector.value 
                  ? "text-primary-foreground" 
                  : "text-foreground"
              )}>
                {sector.title}
              </span>
              
              {/* Indicador visual para setor ativo */}
              {selectedSector === sector.value && (
                <div className="absolute inset-0 rounded-lg ring-2 ring-primary/50 ring-offset-2 ring-offset-background" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
