
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

interface DepositFormDialogProps {
  openDialog: boolean;
  selectedDay: Date | null;
  previewUrl: string | null;
  isUploading: boolean;
  depositoId: string | null;
  setOpenDialog: (open: boolean) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleSubmit: () => void;
}

export function DepositFormDialog({
  openDialog,
  selectedDay,
  previewUrl,
  isUploading,
  depositoId,
  setOpenDialog,
  handleFileChange,
  handleRemoveFile,
  handleSubmit
}: DepositFormDialogProps) {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Depósito Bancário
            {selectedDay && ` - ${format(selectedDay, "dd/MM/yyyy")}`}
          </DialogTitle>
          <DialogDescription>
            Registre seu depósito bancário diário e anexe o comprovante.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comprovante">Comprovante de Depósito</Label>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Comprovante"
                  className="max-h-48 max-w-full object-contain mx-auto border rounded-md"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white rounded-full h-8 w-8 p-0"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para selecionar ou arraste uma imagem
                </p>
                <Input
                  id="comprovante"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="comprovante">
                  <Button variant="outline" type="button" className="cursor-pointer">
                    Selecionar arquivo
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? "Salvando..." : (depositoId ? "Atualizar Depósito" : "Registrar Depósito")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
