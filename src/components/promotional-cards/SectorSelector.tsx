import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Armchair, Shirt, Banknote, Settings } from "lucide-react";

interface SectorSelectorProps {
  selectedSector: "furniture" | "fashion" | "loan" | "service";
  onSectorChange: (sector: string) => void;
}

export function SectorSelector({ selectedSector, onSectorChange }: SectorSelectorProps) {
  const isMobile = useIsMobile();
  
  const sectors = [
    { 
      title: "Móveis", 
      value: "furniture", 
      icon: Armchair,
      gradient: "from-amber-500/20 to-orange-500/20",
      activeGradient: "from-amber-500 to-orange-500",
      borderColor: "hover:border-amber-500/50",
      activeBorder: "border-amber-500",
      textColor: "text-amber-600",
      activeText: "text-white"
    },
    { 
      title: "Moda", 
      value: "fashion", 
      icon: Shirt,
      gradient: "from-pink-500/20 to-rose-500/20",
      activeGradient: "from-pink-500 to-rose-500",
      borderColor: "hover:border-pink-500/50",
      activeBorder: "border-pink-500",
      textColor: "text-pink-600",
      activeText: "text-white"
    },
    { 
      title: "Empréstimo", 
      value: "loan", 
      icon: Banknote,
      gradient: "from-emerald-500/20 to-green-500/20",
      activeGradient: "from-emerald-500 to-green-500",
      borderColor: "hover:border-emerald-500/50",
      activeBorder: "border-emerald-500",
      textColor: "text-emerald-600",
      activeText: "text-white"
    },
    { 
      title: "Geral", 
      value: "service", 
      icon: Settings,
      gradient: "from-blue-500/20 to-indigo-500/20",
      activeGradient: "from-blue-500 to-indigo-500",
      borderColor: "hover:border-blue-500/50",
      activeBorder: "border-blue-500",
      textColor: "text-blue-600",
      activeText: "text-white"
    },
  ];
  
  return (
    <div className="relative">
      <div className="flex gap-2 p-1.5 bg-muted/50 rounded-xl overflow-x-auto scrollbar-hide">
        {sectors.map((sector, index) => {
          const isActive = selectedSector === sector.value;
          const Icon = sector.icon;
          
          return (
            <motion.button
              key={sector.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              onClick={() => onSectorChange(sector.value)}
              className={cn(
                "relative flex items-center gap-2 rounded-lg transition-all duration-300 whitespace-nowrap",
                isMobile 
                  ? "px-3 py-2.5 text-xs" 
                  : "px-4 py-2.5 text-sm",
                isActive
                  ? cn(
                      "bg-gradient-to-r shadow-md scale-[1.02]",
                      sector.activeGradient,
                      sector.activeText
                    )
                  : cn(
                      "bg-card border border-transparent hover:border-border/50",
                      "hover:shadow-sm hover:scale-[1.01]",
                      sector.gradient
                    )
              )}
            >
              <Icon className={cn(
                "transition-all duration-300",
                isMobile ? "h-4 w-4" : "h-4 w-4",
                isActive ? "text-white" : sector.textColor
              )} />
              <span className={cn(
                "font-medium transition-all duration-300",
                isActive ? "text-white" : "text-muted-foreground"
              )}>
                {sector.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
