
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
        return <Badge variant="outline" className="bg-green-100 text-green-800">VM</Badge>;
      case 'informativo':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Informativo</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Carregando orientações...</p>
      ) : (
        <div className="container mx-auto">
          <Table>
            <TableCaption>Lista de orientações de montagem de móveis.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Criado por</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orientacoes.map((orientacao) => (
                <TableRow key={orientacao.id}>
                  <TableCell className="font-medium">{orientacao.titulo}</TableCell>
                  <TableCell>
                    {renderBadge(orientacao.tipo)}
                  </TableCell>
                  <TableCell>{format(new Date(orientacao.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{orientacao.criado_por_nome}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewOrientation(orientacao)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(orientacao.arquivo_url, orientacao.arquivo_nome)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
