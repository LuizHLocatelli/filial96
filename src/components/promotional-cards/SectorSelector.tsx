
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Chair, Shirt, Wallet, Tools } from "lucide-react";

interface SectorSelectorProps {
  selectedSector: "furniture" | "fashion" | "loan" | "service";
  onSectorChange: (sector: string) => void;
}

export function SectorSelector({ selectedSector, onSectorChange }: SectorSelectorProps) {
  const isMobile = useIsMobile();
  
  const sectors = [
    { title: "Móveis", value: "furniture", icon: Chair },
    { title: "Moda", value: "fashion", icon: Shirt },
    { title: "Empréstimo", value: "loan", icon: Wallet },
    { title: "Serviços", value: "service", icon: Tools },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
      {sectors.map(sector => (
        <SectorCard
          key={sector.value}
          title={sector.title}
          value={sector.value}
          isSelected={selectedSector === sector.value}
          onClick={() => onSectorChange(sector.value)}
          isMobile={isMobile}
          Icon={sector.icon}
        />
      ))}
    </div>
  );
}

interface SectorCardProps {
  title: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
  isMobile: boolean | undefined;
  Icon: React.ElementType;
}

function SectorCard({ title, value, isSelected, onClick, isMobile, Icon }: SectorCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all",
        isMobile ? "py-3 px-2" : "p-4 gap-2",
        isSelected
          ? "bg-primary text-primary-foreground ring-2 ring-primary"
          : "bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      onClick={onClick}
    >
      <Icon className={cn("mb-1", isMobile ? "h-5 w-5" : "h-6 w-6")} />
      <h3 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>{title}</h3>
    </Card>
  );
}
