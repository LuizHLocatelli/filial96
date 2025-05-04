
import { Button } from "@/components/ui/button";
import { Package, Truck } from "lucide-react";

interface TaskActionButtonsProps {
  onCreateEntrega: () => void;
  onCreateRetirada: () => void;
}

export function TaskActionButtons({ onCreateEntrega, onCreateRetirada }: TaskActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        className="flex items-center gap-2 justify-center" 
        onClick={onCreateEntrega}
      >
        <Truck className="h-4 w-4" />
        Nova Entrega
      </Button>
      <Button 
        variant="outline"
        className="flex items-center gap-2 justify-center" 
        onClick={onCreateRetirada}
      >
        <Package className="h-4 w-4" />
        Nova Retirada
      </Button>
    </div>
  );
}
