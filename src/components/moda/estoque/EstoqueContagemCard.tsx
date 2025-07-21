import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Eye, CheckCircle, RotateCcw, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Contagem {
  id: string;
  nome: string;
  status: "em_andamento" | "finalizada";
  created_at: string;
  created_by: string;
  produtos_count?: number;
}

interface EstoqueContagemCardProps {
  contagem: Contagem;
  onExcluir: (id: string) => void;
  onAlterarStatus: (id: string, novoStatus: "em_andamento" | "finalizada") => void;
  onAbrir: (contagem: Contagem) => void;
}

export function EstoqueContagemCard({ 
  contagem, 
  onExcluir, 
  onAlterarStatus, 
  onAbrir 
}: EstoqueContagemCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "finalizada":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "Em Andamento";
      case "finalizada":
        return "Finalizada";
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{contagem.nome}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onAbrir(contagem)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              
              {contagem.status === "em_andamento" ? (
                <DropdownMenuItem 
                  onClick={() => onAlterarStatus(contagem.id, "finalizada")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => onAlterarStatus(contagem.id, "em_andamento")}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reabrir
                </DropdownMenuItem>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta contagem? Esta ação não pode ser desfeita 
                      e todos os produtos cadastrados serão perdidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onExcluir(contagem.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Badge className={getStatusColor(contagem.status)} variant="outline">
          {getStatusText(contagem.status)}
        </Badge>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Produtos cadastrados:</span>
            <span className="font-medium">{contagem.produtos_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Criada:</span>
            <span>
              {formatDistanceToNow(new Date(contagem.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => onAbrir(contagem)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}