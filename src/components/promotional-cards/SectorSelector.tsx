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
    <div className="w-full p-3 bg-gradient-to-r from-background to-accent/5 border rounded-xl shadow-sm">
      <div className={cn(
        "gap-2",
        isMobile ? "grid grid-cols-2" : "flex flex-wrap justify-center"
      )}>
        {sectors.map((sector, index) => (
          <button
            key={sector.value}
            onClick={() => onSectorChange(sector.value)}
            className={cn(
              "group relative flex flex-col items-center gap-1.5 rounded-xl transition-all duration-200 border animate-fade-in-up",
              // Tamanhos e espaçamentos otimizados
              isMobile 
                ? "h-16 px-2 py-2" 
                : "h-12 px-3 py-2 flex-row gap-2",
              // Estados visuais melhorados
              selectedSector === sector.value
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                : "bg-card hover:bg-accent/80 border-border/50 hover:border-border hover:shadow-md hover:scale-102"
            )}
            style={{ 
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
          >
            <div className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200",
              isMobile ? "w-6 h-6" : "w-5 h-5",
              selectedSector === sector.value
                ? "bg-primary-foreground/20"
                : "group-hover:bg-accent"
            )}>
              <sector.icon className={cn(
                "transition-all duration-200",
                isMobile ? "h-4 w-4" : "h-4 w-4",
                selectedSector === sector.value 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground group-hover:text-foreground"
              )} />
            </div>
            <span className={cn(
              "font-medium transition-all duration-200 text-center leading-tight",
              isMobile ? "text-[10px]" : "text-xs",
              selectedSector === sector.value 
                ? "text-primary-foreground" 
                : "text-muted-foreground group-hover:text-foreground"
            )}>
              {sector.title}
            </span>
            
            {/* Indicador visual para setor ativo */}
            {selectedSector === sector.value && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
