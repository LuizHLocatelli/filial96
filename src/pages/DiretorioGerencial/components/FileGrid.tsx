import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArquivoGerencial } from "../types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image as ImageIcon, FileSpreadsheet, File as FileIcon, Trash2, Download, Bot, MoreVertical, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArquivosGerenciais } from "../hooks/useArquivosGerenciais";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface FileGridProps {
  pastaAtualId?: string | null;
  onFileClick: (arquivo: ArquivoGerencial, url: string) => void;
  onDeleteFile?: (arquivo: ArquivoGerencial) => void;
  onMoveFile?: (arquivo: ArquivoGerencial) => void;
  searchQuery?: string;
}

export const FileGrid = ({ 
  pastaAtualId,
  onFileClick, 
  onDeleteFile,
  onMoveFile,
  searchQuery = "" 
}: FileGridProps) => {
  const { arquivos, isLoading } = useArquivosGerenciais(pastaAtualId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!arquivos || arquivos.length === 0) {
    return (
      <div className="text-center p-12 glass-panel rounded-xl">
        <FileIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Nenhum arquivo encontrado</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Faça o upload do seu primeiro documento para começar.
        </p>
      </div>
    );
  }

  // Filter files based on search
  const filteredArquivos = arquivos.filter(arq => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = arq.nome_arquivo.toLowerCase().includes(searchLower);
    const tagsMatch = arq.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    const resumoMatch = arq.resumo_ia?.toLowerCase().includes(searchLower);
    return nameMatch || tagsMatch || resumoMatch;
  });

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    return <FileIcon className="w-8 h-8 text-gray-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (e: React.MouseEvent, arq: ArquivoGerencial) => {
    e.stopPropagation();
    try {
      const { data, error } = await supabase.storage
        .from('diretorio_gerencial')
        .download(arq.caminho_storage);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = arq.nome_arquivo;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const handleDelete = (e: React.MouseEvent, arq: ArquivoGerencial) => {
    e.stopPropagation();
    if (onDeleteFile) {
      onDeleteFile(arq);
    }
  };

  const handleMove = (e: React.MouseEvent, arq: ArquivoGerencial) => {
    e.stopPropagation();
    if (onMoveFile) {
      onMoveFile(arq);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredArquivos.map((arq) => {
        const { data: { publicUrl } } = supabase.storage
          .from('diretorio_gerencial')
          .getPublicUrl(arq.caminho_storage);

        return (
          <Card 
            key={arq.id} 
            className="group glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col h-full"
            onClick={() => onFileClick(arq, publicUrl)}
          >
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
              <div className="p-2 bg-background/50 rounded-lg">
                {getFileIcon(arq.tipo_arquivo)}
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => handleDownload(e, arq)}>
                  <Download className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onMoveFile && (
                      <DropdownMenuItem onClick={(e) => handleMove(e, arq)}>
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Mover
                      </DropdownMenuItem>
                    )}
                    {onDeleteFile && (
                      <DropdownMenuItem 
                        onClick={(e) => handleDelete(e, arq)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-grow">
              <h4 className="font-medium text-sm line-clamp-2 mb-1" title={arq.nome_arquivo}>
                {arq.nome_arquivo}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                {formatSize(arq.tamanho_bytes)} • {formatDistanceToNow(new Date(arq.created_at), { addSuffix: true, locale: ptBR })}
              </p>
              
              {arq.resumo_ia && (
                <div className="bg-primary/5 rounded p-2 mb-3">
                  <div className="flex items-center space-x-1 mb-1 text-primary">
                    <Bot className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Resumo IA</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {arq.resumo_ia}
                  </p>
                </div>
              )}
            </CardContent>
            {arq.tags && arq.tags.length > 0 && (
              <CardFooter className="p-4 pt-0 flex flex-wrap gap-1">
                {arq.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {tag}
                  </Badge>
                ))}
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
};
