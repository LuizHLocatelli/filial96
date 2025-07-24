import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProdutoForm } from "./ProdutoForm";
import { ProdutosList } from "./ProdutosList";

interface Contagem {
  id: string;
  nome: string;
  status: "em_andamento" | "finalizada";
  created_at: string;
  created_by: string;
  produtos_count?: number;
}

interface DetalheContagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contagem: Contagem;
  onContagemAtualizada: () => void;
}

export function DetalheContagemDialog({ 
  open, 
  onOpenChange, 
  contagem,
  onContagemAtualizada
}: DetalheContagemDialogProps) {
  const [activeTab, setActiveTab] = useState("produtos");

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <DialogTitle className="text-lg">{contagem.nome}</DialogTitle>
                <DialogDescription>
                  Criada {formatDistanceToNow(new Date(contagem.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </DialogDescription>
              </div>
            </div>
            <Badge className={getStatusColor(contagem.status)} variant="outline">
              {getStatusText(contagem.status)}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="adicionar" disabled={contagem.status === "finalizada"}>
              Adicionar Produto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="mt-4">
            <ProdutosList 
              contagemId={contagem.id} 
              contagemStatus={contagem.status}
              onProdutoAtualizado={onContagemAtualizada}
            />
          </TabsContent>

          <TabsContent value="adicionar" className="mt-4">
            <ProdutoForm 
              contagemId={contagem.id}
              onProdutoAdicionado={() => {
                onContagemAtualizada();
                setActiveTab("produtos");
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}