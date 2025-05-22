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
import { Edit, Copy, Trash2, MoreHorizontal, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type Orientacao = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  data_criacao: string;
  criado_por: string;
  criado_por_nome?: string;
};

export function OrientacoesList() {
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Inside the component where data is loaded and processed:
const fetchOrientacoes = async () => {
  setIsLoading(true);
  try {
    const { data, error } = await supabase
      .from('moveis_orientacoes')
      .select(`
        *,
        criado_por_nome:profiles(name)
      `);

    if (error) throw error;

    // Map the data to include the creator's name
    const orientacoesWithAuthor = data.map(item => ({
      ...item,
      // Handle the case where profiles might not be returned correctly
      criado_por_nome: item.criado_por_nome?.name || 'Usuário'
    }));

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
                    <Badge variant="secondary">{orientacao.tipo}</Badge>
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
        </div>
      )}
    </div>
  );
}
