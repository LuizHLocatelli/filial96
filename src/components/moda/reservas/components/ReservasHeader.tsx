
import { Clock, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AddReservaDialog } from "./AddReservaDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReservasHeaderProps {
  totalReservas: number;
}

export function ReservasHeader({ totalReservas }: ReservasHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <PageHeader
      title="Reservas"
      description="Gerenciamento inteligente de reservas de produtos"
      icon={Clock}
      iconColor="text-green-600"
      status={{
        label: `${totalReservas} ${totalReservas === 1 ? 'reserva' : 'reservas'}`,
        variant: "secondary"
      }}
      actions={
        <AddReservaDialog 
          variant="prominent" 
          className={isMobile ? 'w-full' : ''} 
        />
      }
      fullWidthActionsOnMobile={true}
    />
  );
}
