import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Eye, Download, Calendar, User, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface CardViewDialogProps {
  card: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export function CardViewDialog({ card, open, onOpenChange, onEdit }: CardViewDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  if (!card) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      case 'inativo':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      case 'rascunho':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Visualizar Card
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Detalhes completos do card promocional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com status e título */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(card.status)}>
                {card.status?.toUpperCase() || 'INDEFINIDO'}
              </Badge>
              {card.created_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(card.created_at)}</span>
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold">{card.title || 'Sem título'}</h2>
          </div>

          {/* Metadados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            {card.sector && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Setor: {card.sector}</span>
              </div>
            )}
            {card.created_by_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Criado por: {card.created_by_name}</span>
              </div>
            )}
          </div>

          {/* Conteúdo/Descrição */}
          {card.content && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Conteúdo</h3>
              <div className="prose prose-sm max-w-none p-4 bg-background border rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: card.content }} />
              </div>
            </div>
          )}

          {/* Imagem do card */}
          {card.image_url && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Imagem</h3>
              <Card>
                <CardContent className="p-4">
                  <img
                    src={card.image_url}
                    alt={card.title || 'Card promocional'}
                    className="w-full h-auto max-h-96 object-contain rounded-lg border"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Datas de validade */}
          {(card.valid_from || card.valid_until) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-green-600" />
                Período de Validade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                {card.valid_from && (
                  <div>
                    <span className="text-sm font-medium">Válido a partir de:</span>
                    <p className="text-sm">{formatDate(card.valid_from)}</p>
                  </div>
                )}
                {card.valid_until && (
                  <div>
                    <span className="text-sm font-medium">Válido até:</span>
                    <p className="text-sm">{formatDate(card.valid_until)}</p>
                  </div>
                )}
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
          {onEdit && (
            <Button 
              onClick={onEdit}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
            >
              Editar Card
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
