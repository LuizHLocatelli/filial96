
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectorSelectorProps {
  selectedSector: "furniture" | "fashion";
  onSectorChange: (sector: string) => void;
}

export function SectorSelector({ selectedSector, onSectorChange }: SectorSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4">
      <SectorCard
        title="Móveis"
        value="furniture"
        isSelected={selectedSector === "furniture"}
        onClick={() => onSectorChange("furniture")}
      />
      
      <SectorCard
        title="Moda"
        value="fashion"
        isSelected={selectedSector === "fashion"}
        onClick={() => onSectorChange("fashion")}
      />
    </div>
  );
}

interface SectorCardProps {
  title: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

function SectorCard({ title, value, isSelected, onClick }: SectorCardProps) {
  return (
    <Card
      className={cn(
        "relative p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer h-24 transition-all",
        isSelected
          ? "bg-primary text-primary-foreground ring-2 ring-primary"
          : "bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm">
        Cards promocionais de {title.toLowerCase()}
      </p>
    </Card>
  );
}
