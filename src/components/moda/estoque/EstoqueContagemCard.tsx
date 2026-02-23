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
import { MoreVertical, Eye, CheckCircle, RotateCcw, Trash2, Calendar, Package } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Contagem {
  id: string;
  nome: string;
  setor: string;
  status: "em_andamento" | "finalizada";
  created_at: string;
  created_by: string;
  produtos_count?: number;
}

const setores = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "infantil", label: "Infantil" }
];

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
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
      case "finalizada":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
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

  const getSetorColor = (setor: string) => {
    switch (setor) {
      case "masculino":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30";
      case "feminino":
        return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30";
      case "infantil":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getSetorLabel = (setor: string) => {
    return setores.find((s) => s.value === setor)?.label || setor;
  };

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${
      contagem.status === "finalizada" 
        ? "border-l-emerald-500 hover:border-l-emerald-400" 
        : "border-l-amber-500 hover:border-l-amber-400"
    } bg-card/60 backdrop-blur-sm`}>
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <CardTitle 
              className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
              onClick={() => onAbrir(contagem)}
              title={contagem.nome}
            >
              {contagem.nome}
            </CardTitle>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge className={`${getStatusColor(contagem.status)} font-medium`} variant="outline">
                {contagem.status === "finalizada" && <CheckCircle className="w-3 h-3 mr-1" />}
                {contagem.status === "em_andamento" && <RotateCcw className="w-3 h-3 mr-1" />}
                {getStatusText(contagem.status)}
              </Badge>
              <Badge className={`${getSetorColor(contagem.setor)} font-medium`} variant="outline">
                {getSetorLabel(contagem.setor)}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu de opções</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1">
              <DropdownMenuItem onClick={() => onAbrir(contagem)} className="gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                <span>Visualizar</span>
              </DropdownMenuItem>
              
              {contagem.status === "em_andamento" ? (
                <DropdownMenuItem 
                  onClick={() => onAlterarStatus(contagem.id, "finalizada")}
                  className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-950/50"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Finalizar Contagem</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => onAlterarStatus(contagem.id, "em_andamento")}
                  className="gap-2 cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-950/50"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reabrir Contagem</span>
                </DropdownMenuItem>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir contagem?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os produtos registrados em <strong>"{contagem.nome}"</strong> serão permanentemente removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onExcluir(contagem.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir Contagem
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-4 px-5">
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Itens</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {contagem.produtos_count || 0}
            </div>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Criada em</span>
            </div>
            <div className="text-sm font-semibold text-foreground" title={format(new Date(contagem.created_at), "dd/MM/yyyy HH:mm")}>
              {formatDistanceToNow(new Date(contagem.created_at), { locale: ptBR, addSuffix: true })}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 px-5 pb-5">
        <Button 
          variant="secondary" 
          className="w-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm" 
          onClick={() => onAbrir(contagem)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Acessar Contagem
        </Button>
      </CardFooter>
    </Card>
  );
}
