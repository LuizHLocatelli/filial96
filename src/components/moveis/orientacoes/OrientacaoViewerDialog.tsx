import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, User, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Orientacao } from "./types";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface OrientacaoViewerDialogProps {
  orientacao: Orientacao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrientacaoViewerDialog({
  orientacao,
  open,
  onOpenChange
}: OrientacaoViewerDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  if (!orientacao) return null;

  const tipoLabel = orientacao.tipo === 'vm' ? 'VM' : 'Informativo';
  const tipoColor = orientacao.tipo === 'vm' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Visualizar {tipoLabel}
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Detalhes completos da orientação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com tipo e título */}
          <div className="space-y-3">
            <Badge className={tipoColor}>
              {tipoLabel}
            </Badge>
            <h2 className="text-xl font-semibold">{orientacao.titulo}</h2>
          </div>

          {/* Metadados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Criado em: {format(new Date(orientacao.created_at || orientacao.data_criacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Por: {orientacao.user_name || 'Sistema'}</span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Conteúdo</h3>
            <div className="prose prose-sm max-w-none p-4 bg-background border rounded-lg">
              {orientacao.conteudo ? (
                <div dangerouslySetInnerHTML={{ __html: orientacao.conteudo }} />
              ) : (
                <p className="text-muted-foreground italic">Nenhum conteúdo definido</p>
              )}
            </div>
          </div>

          {/* Anexos */}
          {orientacao.anexos && orientacao.anexos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Anexos</h3>
              <div className="grid grid-cols-1 gap-3">
                {orientacao.anexos.map((anexo, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{anexo.nome}</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href={anexo.url} download target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div {...getMobileFooterProps()}>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="px-6"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
