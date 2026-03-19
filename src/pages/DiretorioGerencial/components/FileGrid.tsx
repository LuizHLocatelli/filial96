import { memo } from "react";
import { File as FileIcon } from "lucide-react";
import { FileCard } from "./FileCard";
import { ArquivoGerencial } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface FileGridProps {
  arquivos: ArquivoGerencial[] | undefined;
  isLoading: boolean;
  onFileClick: (arquivo: ArquivoGerencial) => void;
  onDeleteFile?: (arquivo: ArquivoGerencial) => void;
  onMoveFile?: (arquivo: ArquivoGerencial) => void;
  searchQuery?: string;
}

export const FileGrid = memo(function FileGrid({
  arquivos,
  isLoading,
  onFileClick,
  onDeleteFile,
  onMoveFile,
  searchQuery = "",
}: FileGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
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
          {searchQuery
            ? "Tente ajustar sua busca"
            : "Faça o upload do seu primeiro documento para começar."}
        </p>
      </div>
    );
  }

  const filteredArquivos = arquivos.filter((arq) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = arq.nome_arquivo.toLowerCase().includes(searchLower);
    const tagsMatch = arq.tags?.some((tag) =>
      tag.toLowerCase().includes(searchLower)
    );
    const resumoMatch = arq.resumo_ia?.toLowerCase().includes(searchLower);
    return nameMatch || tagsMatch || resumoMatch;
  });

  if (filteredArquivos.length === 0) {
    return (
      <div className="text-center p-12 glass-panel rounded-xl">
        <FileIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Nenhum arquivo encontrado</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Nenhum arquivo corresponde à sua busca
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredArquivos.map((arquivo) => (
        <FileCard
          key={arquivo.id}
          arquivo={arquivo}
          onClick={() => onFileClick(arquivo)}
          onDelete={onDeleteFile}
          onMove={onMoveFile}
        />
      ))}
    </div>
  );
});
