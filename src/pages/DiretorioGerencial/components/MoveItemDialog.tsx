import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Loader2, Folder, Home, ChevronRight } from "lucide-react";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { PastaGerencial } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MoveItemDialogProps {
  itemType: 'arquivo' | 'pasta';
  itemName: string;
  currentPastaId: string | null;
  pastas: PastaGerencial[] | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMove: (pastaDestinoId: string | null) => Promise<void>;
  isLoading?: boolean;
}

export function MoveItemDialog({ 
  itemType, 
  itemName, 
  currentPastaId,
  pastas,
  isOpen, 
  onOpenChange, 
  onMove, 
  isLoading 
}: MoveItemDialogProps) {
  const isMobile = useIsMobile();
  const [selectedPastaId, setSelectedPastaId] = useState<string | null>(null);

  const handleMove = async () => {
    await onMove(selectedPastaId);
    setSelectedPastaId(null);
  };

  const handleClose = () => {
    setSelectedPastaId(null);
    onOpenChange(false);
  };

  const isRootSelected = selectedPastaId === null;
  const isCurrentFolder = selectedPastaId === currentPastaId;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'}
          max-h-[85vh] overflow-y-auto flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={ArrowRightLeft}
          iconColor="primary"
          title={`Mover ${itemType === 'arquivo' ? 'Arquivo' : 'Pasta'}`}
          description={`Mover "${itemName}" para:`}
          onClose={handleClose}
          loading={isLoading}
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ScrollArea className="h-[300px] rounded-md border">
            <div className="p-2 space-y-1">
              {/* Raiz */}
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isRootSelected && "bg-primary/10 text-primary"
                )}
                onClick={() => setSelectedPastaId(null)}
              >
                <Home className="mr-2 h-4 w-4" />
                Diretório Raiz
                {isRootSelected && <span className="ml-auto text-xs">Selecionado</span>}
              </Button>

              {pastas?.map((pasta) => {
                const isSelected = selectedPastaId === pasta.id;
                const isDisabled = pasta.id === currentPastaId;
                
                return (
                  <Button
                    key={pasta.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isSelected && "bg-primary/10 text-primary",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isDisabled && setSelectedPastaId(pasta.id)}
                    disabled={isDisabled}
                  >
                    <Folder className="mr-2 h-4 w-4 flex-shrink-0" style={{ color: pasta.cor }} />
                    <span className="truncate">{pasta.nome}</span>
                    {isSelected && <span className="ml-auto text-xs flex-shrink-0">Selecionado</span>}
                    {isDisabled && <span className="ml-auto text-xs flex-shrink-0 text-muted-foreground">Atual</span>}
                  </Button>
                );
              })}

              {(!pastas || pastas.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma pasta disponível
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            disabled={isLoading || isCurrentFolder}
            onClick={handleMove}
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Movendo...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4" />
                Mover Aqui
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
