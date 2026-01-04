
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddReservaDialog } from "./AddReservaDialog";
import { useReservas } from "../hooks/useReservas";
import { ReservaFormData } from "../types";

interface AddReservaButtonProps {
  className?: string;
}

export function AddReservaButton({ className }: AddReservaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createReserva } = useReservas();

  const handleSubmit = async (data: ReservaFormData) => {
    setIsSubmitting(true);
    try {
      await createReserva(data);
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={className}>
        <Plus className="h-4 w-4 mr-2" />
        Nova Reserva
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
