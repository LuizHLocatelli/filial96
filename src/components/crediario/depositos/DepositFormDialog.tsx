
import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, CheckCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";
import { ptBR } from "date-fns/locale";
import type { Deposito } from "@/hooks/crediario/useDepositos";

interface DepositFormDialogProps {
  openDialog: boolean;
  selectedDay: Date | null;
  previewUrl: string | null;
  isUploading: boolean;
  depositoId: string | null;
  depositosForDay: Deposito[];
  setOpenDialog: (open: boolean) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleSubmit: (jaIncluido: boolean) => void;
  onAddNewDeposito: () => void;
  onViewDeposito: (deposito: Deposito) => void;
}

export function DepositFormDialog({
  openDialog,
  selectedDay,
  previewUrl,
  isUploading,
  depositoId,
  depositosForDay = [],
  setOpenDialog,
  handleFileChange,
  handleRemoveFile,
  handleSubmit,
  onAddNewDeposito,
  onViewDeposito
}: DepositFormDialogProps) {
  // Create a reference to the file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [jaIncluido, setJaIncluido] = useState(false);

  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className={isMobile ? "w-[95vw] max-w-[95vw] p-4" : ""}>
        <DialogHeader>
          <DialogTitle className="text-xl">
            Depósito Bancário
            {selectedDay && ` - ${format(selectedDay, "dd/MM/yyyy", { locale: ptBR })}`}
          </DialogTitle>
          <DialogDescription>
            {depositosForDay.length > 0 
              ? `${depositosForDay.length} depósito(s) registrado(s) para esta data.` 
              : "Registre seu depósito bancário diário e anexe o comprovante."}
          </DialogDescription>
        </DialogHeader>
        
        {depositosForDay.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="text-sm font-medium">Depósitos existentes:</div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {depositosForDay.map(deposito => (
                <div key={deposito.id} 
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => onViewDeposito(deposito)}
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <div className="text-sm">
                      {format(deposito.data, "dd/MM/yyyy")}
                      {deposito.comprovante && (
                        <span className="ml-2 text-blue-500 text-xs">
                          (Com comprovante)
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    onViewDeposito(deposito);
                  }}>
                    Visualizar
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={onAddNewDeposito} className="w-full">
              Adicionar Novo Depósito
            </Button>
          </div>
        )}
        
        {(depositosForDay.length === 0 || depositoId) && (
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
                <div 
                  className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2 text-center">
                    {isMobile ? "Toque para selecionar" : "Clique para selecionar ou arraste uma imagem"}
                  </p>
                  <Input
                    id="comprovante"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="cursor-pointer w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                  >
                    Selecionar arquivo
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ja-incluido" 
                checked={jaIncluido} 
                onCheckedChange={(checked) => setJaIncluido(checked === true)}
              />
              <label
                htmlFor="ja-incluido"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Esse depósito já foi incluído?
              </label>
            </div>
            
            <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
              <Button 
                variant="outline" 
                onClick={() => setOpenDialog(false)}
                className={isMobile ? "w-full" : ""}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => handleSubmit(jaIncluido)} 
                disabled={isUploading}
                className={isMobile ? "w-full" : ""}
              >
                {isUploading ? "Salvando..." : (depositoId ? "Atualizar Depósito" : "Registrar Depósito")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
