
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddReservaDialog } from "./AddReservaDialog";
import { useReservas } from "../hooks/useReservas";
import { ReservaFormData } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddReservaButtonProps {
  variant?: 'default' | 'prominent' | 'floating';
  className?: string;
}

export function AddReservaButton({ variant = 'default', className }: AddReservaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createReserva } = useReservas();
  const isMobile = useIsMobile();

  const handleSubmit = async (data: ReservaFormData) => {
    setIsSubmitting(true);
    try {
      await createReserva(data);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 font-medium";
    
    switch (variant) {
      case 'floating':
        return `${baseStyles} fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 justify-center hover:scale-110 shadow-2xl hover:shadow-green-500/25 ${isMobile ? 'bottom-20 right-4' : ''}`;
      case 'prominent':
        return `${baseStyles} h-12 px-8 text-base rounded-xl hover:scale-105 shadow-green-500/20 ${
          isMobile ? 'w-full justify-center h-11' : ''
        }`;
      default:
        return `${baseStyles} h-12 px-6 text-base rounded-xl hover:scale-105 ${
          isMobile ? 'w-full justify-center' : ''
        }`;
    }
  };

  const getButtonContent = () => {
    if (variant === 'floating') {
      return <Plus className="h-6 w-6" />;
    }
    return (
      <>
        <Plus className="h-4 w-4" />
        Nova Reserva
      </>
    );
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`${getButtonStyles()} ${className || ''}`}
      >
        {getButtonContent()}
      </Button>
      
      <AddReservaDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
