import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Copy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";

interface FolderItem {
  id: string;
  name: string;
}

interface CardViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  imageUrl: string;
  code: string;
  startDate: string;
  endDate: string;
  currentFolder: FolderItem;
  isMobile: boolean;
}

export function CardViewDialog({
  open,
  onOpenChange,
  title,
  imageUrl,
  code,
  startDate,
  endDate,
  currentFolder,
}: CardViewDialogProps) {
  const isMobile = useIsMobile();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-2xl p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Eye}
          iconColor="primary"
          title="Visualizar Card"
          description="Detalhes do card promocional"
          onClose={() => onOpenChange(false)}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img
                src={imageUrl}
                alt={title}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Badge variant="outline">{currentFolder.name}</Badge>
            </div>

            {code && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Código:</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">{code}</code>
                  <Button size="sm" variant="outline" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {(startDate || endDate) && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {startDate && (
                  <div>
                    <label className="font-medium">Data de Início:</label>
                    <p>{startDate}</p>
                  </div>
                )}
                {endDate && (
                  <div>
                    <label className="font-medium">Data de Fim:</label>
                    <p>{endDate}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            onClick={() => onOpenChange(false)}
            className={isMobile ? 'w-full' : ''}
          >
            Fechar
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
