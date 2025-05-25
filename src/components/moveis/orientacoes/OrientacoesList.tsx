import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Copy, Trash2, MoreHorizontal, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrientacaoViewerDialog } from './OrientacaoViewerDialog';
import { Orientacao } from './types';

export function OrientacoesList() {
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrientacao, setSelectedOrientacao] = useState<Orientacao | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchOrientacoes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('moveis_orientacoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      // Use a default name instead of trying to get it from profiles
      const orientacoesWithAuthor = data.map(item => {
        return {
          ...item,
          criado_por_nome: 'Usuário'
        };
      });

      setOrientacoes(orientacoesWithAuthor as Orientacao[]);
    } catch (error: any) {
      console.error("Erro ao buscar orientações:", error);
      toast({
        title: "Erro ao carregar orientações",
        description: error.message || "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrientacoes();
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Iniciado",
        description: "O arquivo será baixado em breve.",
      })
    } catch (error) {
      console.error("Erro ao fazer download do arquivo:", error);
      toast({
        title: "Erro ao fazer download",
        description: "Houve um problema ao iniciar o download.",
        variant: "destructive",
      });
    }
  };

  const handleViewOrientation = (orientacao: Orientacao) => {
    setSelectedOrientacao(orientacao);
    setViewerOpen(true);
  };

  const renderBadge = (tipo: string) => {
    switch (tipo) {
      case 'vm':
        return <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">VM</Badge>;
      case 'informativo':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">Info</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{tipo}</Badge>;
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {isLoading ? (
        <p className="text-center py-8">Carregando orientações...</p>
      ) : (
        <div className="w-full overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="text-xs sm:text-sm py-2 sm:py-4">
                Lista de orientações de montagem de móveis.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] text-xs sm:text-sm px-2 py-3 sm:px-4 sm:py-3">Título</TableHead>
                  <TableHead className="min-w-[80px] text-xs sm:text-sm px-2 py-3 sm:px-4 sm:py-3">Tipo</TableHead>
                  <TableHead className="min-w-[100px] text-xs sm:text-sm hidden sm:table-cell px-2 py-3 sm:px-4 sm:py-3">Data</TableHead>
                  <TableHead className="min-w-[80px] text-xs sm:text-sm hidden md:table-cell px-2 py-3 sm:px-4 sm:py-3">Criado por</TableHead>
                  <TableHead className="min-w-[80px] text-right text-xs sm:text-sm px-2 py-3 sm:px-4 sm:py-3">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orientacoes.map((orientacao) => (
                  <TableRow key={orientacao.id}>
                    <TableCell className="font-medium text-xs sm:text-sm max-w-[120px] truncate px-2 py-3 sm:px-4 sm:py-3">
                      {orientacao.titulo}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm px-2 py-3 sm:px-4 sm:py-3">
                      {renderBadge(orientacao.tipo)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell px-2 py-3 sm:px-4 sm:py-3">
                      {format(new Date(orientacao.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell max-w-[80px] truncate px-2 py-3 sm:px-4 sm:py-3">
                      {orientacao.criado_por_nome}
                    </TableCell>
                    <TableCell className="text-right px-2 py-3 sm:px-4 sm:py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel className="text-xs">Ações</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => handleViewOrientation(orientacao)}
                            className="text-xs"
                          >
                            <Eye className="mr-2 h-3 w-3" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDownload(orientacao.arquivo_url, orientacao.arquivo_nome)}
                            className="text-xs"
                          >
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {selectedOrientacao && (
            <OrientacaoViewerDialog
              open={viewerOpen}
              onOpenChange={setViewerOpen}
              orientacao={selectedOrientacao}
            />
          )}
        </div>
      )}
    </div>
  );
}
