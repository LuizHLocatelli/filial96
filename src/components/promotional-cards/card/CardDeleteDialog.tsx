import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  isMobile?: boolean;
}

export function CardDeleteDialog({ 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  isLoading,
  isMobile
}: CardDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[90vw] sm:max-w-md p-4 sm:p-6 dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg">Excluir card promocional?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm">
            Esta ação não pode ser desfeita. O card será permanentemente excluído do sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="text-xs sm:text-sm h-8 sm:h-10"
            disabled={isLoading}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="text-xs sm:text-sm h-8 sm:h-10"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
