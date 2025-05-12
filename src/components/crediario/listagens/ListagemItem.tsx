
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Listagem } from "@/hooks/crediario/useListagens";
import { getIndicatorColor } from "@/components/crediario/types";
import { useNavigate } from "react-router-dom";

interface ListagemItemProps {
  item: Listagem;
  onView: (fileUrl: string, nome: string) => void;
  onDelete: (id: string, fileUrl: string) => void;
}

export function ListagemItem({ item, onView, onDelete }: ListagemItemProps) {
  const navigate = useNavigate();
  
  const handleViewInNewPage = () => {
    window.open(`/pdf-viewer?url=${encodeURIComponent(item.fileUrl)}&name=${encodeURIComponent(item.nome)}`, "_blank");
  };
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{item.nome}</p>
            {item.indicator && (
              <Badge className={`${getIndicatorColor(item.indicator)} text-white`}>
                {item.indicator}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {format(item.createdAt, "dd/MM/yyyy")}
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button size="sm" variant="ghost" onClick={handleViewInNewPage}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(item.id, item.fileUrl)}>
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Excluir</span>
        </Button>
      </div>
    </div>
  );
}
