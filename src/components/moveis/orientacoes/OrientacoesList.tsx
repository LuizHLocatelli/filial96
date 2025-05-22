
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, FileText, Image, FileArchive, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Orientacao } from "./types";
import { OrientacaoViewerDialog } from "./OrientacaoViewerDialog";

interface OrientacoesListProps {
  refreshKey?: number;
}

export function OrientacoesList({ refreshKey = 0 }: OrientacoesListProps) {
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<string | null>(null);
  const [orientacaoSelecionada, setOrientacaoSelecionada] = useState<Orientacao | null>(null);
  const [showViewerDialog, setShowViewerDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrientacoes = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("moveis_orientacoes")
          .select("*")
          .order("data_criacao", { ascending: false });

        if (tipoFiltro) {
          query = query.eq("tipo", tipoFiltro);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Type casting to ensure correct type
        const orientacoesFormatadas = (data || []).map(item => ({
          id: item.id,
          titulo: item.titulo,
          tipo: item.tipo as "vm" | "informativo" | "outro",
          descricao: item.descricao,
          arquivo_url: item.arquivo_url,
          arquivo_nome: item.arquivo_nome,
          arquivo_tipo: item.arquivo_tipo,
          data_criacao: item.data_criacao,
          criado_por: item.criado_por,
          criado_por_nome: item.profiles?.nome || 'Usuário'
        }));

        setOrientacoes(orientacoesFormatadas);
      } catch (error) {
        console.error("Erro ao buscar orientações:", error);
        toast({
          title: "Erro ao carregar orientações",
          description: "Não foi possível carregar a lista de orientações.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrientacoes();
  }, [tipoFiltro, refreshKey, toast]);

  const handleVerOrientacao = (orientacao: Orientacao) => {
    setOrientacaoSelecionada(orientacao);
    setShowViewerDialog(true);
  };

  const getTipoIcon = (tipo: string, arquivoTipo: string) => {
    if (arquivoTipo.includes("image")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (arquivoTipo.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <FileArchive className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTipoBadge = (tipo: "vm" | "informativo" | "outro") => {
    switch (tipo) {
      case "vm":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">VM</Badge>;
      case "informativo":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Informativo</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300">Outro</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
        <p className="text-muted-foreground">Carregando orientações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="todos" onValueChange={(value) => setTipoFiltro(value === "todos" ? null : value)}>
        <TabsList className="w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="todos" className="flex-1">Todos</TabsTrigger>
          <TabsTrigger value="vm" className="flex-1">VM</TabsTrigger>
          <TabsTrigger value="informativo" className="flex-1">Informativos</TabsTrigger>
          <TabsTrigger value="outro" className="flex-1">Outros</TabsTrigger>
        </TabsList>
      </Tabs>

      {orientacoes.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-background">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma orientação encontrada</h3>
          <p className="text-muted-foreground mt-2">
            Nenhuma orientação disponível para a categoria selecionada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orientacoes.map((orientacao) => (
            <Card key={orientacao.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2">{orientacao.titulo}</CardTitle>
                  {getTipoIcon(orientacao.tipo, orientacao.arquivo_tipo)}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  {getTipoBadge(orientacao.tipo)}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(orientacao.data_criacao), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
                <p className="text-sm line-clamp-3">{orientacao.descricao}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => handleVerOrientacao(orientacao)} 
                  variant="outline" 
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {orientacaoSelecionada && (
        <OrientacaoViewerDialog
          open={showViewerDialog}
          onOpenChange={setShowViewerDialog}
          orientacao={orientacaoSelecionada}
        />
      )}
    </div>
  );
}
