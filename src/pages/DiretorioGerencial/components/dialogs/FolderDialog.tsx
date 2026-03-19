import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderPlus, Edit3 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { useIsMobile } from "@/hooks/use-mobile";
import { FolderDialogMode, FolderFormData } from "../../types";

const folderSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

interface FolderDialogProps {
  mode: FolderDialogMode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FolderFormData) => Promise<void>;
  initialData?: {
    nome?: string;
  };
  isLoading?: boolean;
}

export function FolderDialog({
  mode,
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FolderDialogProps) {
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ nome: string }>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      nome: initialData?.nome || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ nome: initialData?.nome || "" });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: { nome: string }) => {
    await onSubmit({ nome: data.nome });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Nova Pasta";
      case "edit":
      case "rename":
        return "Renomear Pasta";
      default:
        return "Pasta";
    }
  };

  const getIcon = () => {
    return mode === "create" ? FolderPlus : Edit3;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`
          ${isMobile ? "w-[calc(100%-2rem)] max-w-full p-0" : "sm:max-w-[500px] p-0"}
          max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={getIcon()}
          iconColor="primary"
          title={getTitle()}
          onClose={handleClose}
          loading={isLoading}
        />

        <DialogScrollableContainer>
          <form id="folder-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="folder-name" className="text-base">
                Nome da Pasta
              </Label>
              <Input
                id="folder-name"
                {...register("nome")}
                placeholder="Digite o nome da pasta"
                disabled={isLoading}
                className="h-12 mt-1"
                autoFocus
              />
              {errors.nome && (
                <p className="text-sm text-destructive mt-1">
                  {errors.nome.message}
                </p>
              )}
            </div>
          </form>
        </DialogScrollableContainer>

        <StandardDialogFooter
          className={isMobile ? "flex-col gap-2" : "flex-row gap-3"}
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className={isMobile ? "w-full h-10" : ""}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="folder-form"
            disabled={isLoading}
            className={`gap-2 ${isMobile ? "w-full h-10" : ""}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "create" ? "Criando..." : "Salvando..."}
              </>
            ) : (
              <>
                {mode === "create" ? (
                  <FolderPlus className="h-4 w-4" />
                ) : (
                  <Edit3 className="h-4 w-4" />
                )}
                {mode === "create" ? "Criar Pasta" : "Salvar"}
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
