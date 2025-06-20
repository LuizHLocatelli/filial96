
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, User, Eye, Copy } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import { toast } from "@/components/ui/use-toast";

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
  isMobile
}: CardViewDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("large")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualizar Card
          </DialogTitle>
          <DialogDescription>
            Detalhes do card promocional
          </DialogDescription>
        </DialogHeader>

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

        <div {...getMobileFooterProps()}>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
