
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectorSelectorProps {
  selectedSector: "furniture" | "fashion";
  onSectorChange: (sector: string) => void;
}

export function SectorSelector({ selectedSector, onSectorChange }: SectorSelectorProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4">
      <SectorCard
        title="Móveis"
        value="furniture"
        isSelected={selectedSector === "furniture"}
        onClick={() => onSectorChange("furniture")}
        isMobile={isMobile}
      />
      
      <SectorCard
        title="Moda"
        value="fashion"
        isSelected={selectedSector === "fashion"}
        onClick={() => onSectorChange("fashion")}
        isMobile={isMobile}
      />
    </div>
  );
}

interface SectorCardProps {
  title: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
  isMobile: boolean | undefined;
}

function SectorCard({ title, value, isSelected, onClick, isMobile }: SectorCardProps) {
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
      <h3 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>{title}</h3>
      <p className={cn("text-sm", isMobile && "text-xs")}>
        Cards promocionais de {title.toLowerCase()}
      </p>
    </Card>
  );
}
