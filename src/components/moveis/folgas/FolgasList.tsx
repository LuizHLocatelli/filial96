
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Folga } from "./types";
import { Badge } from "@/components/ui/badge";

interface FolgasListProps {
  folgas: Folga[];
  isLoading: boolean;
  handleDeleteFolga: (folgaId: string) => void;
  getConsultorById: (id: string) => any;
}

export function FolgasList({
  folgas,
  isLoading,
  handleDeleteFolga,
  getConsultorById,
}: FolgasListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (folgas.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Nenhuma folga registrada</h3>
          <p className="text-muted-foreground text-center">
            As folgas registradas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedFolgas = [...folgas].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedFolgas.map((folga) => {
        const consultor = getConsultorById(folga.consultorId);
        const consultorName = consultor ? consultor.nome : "Consultor não encontrado";

        return (
          <Card key={folga.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2.5 rounded-md">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h4 className="font-medium">{consultorName}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(folga.data), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      {folga.motivo && (
                        <Badge variant="outline" className="font-normal">
                          {folga.motivo}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteFolga(folga.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
