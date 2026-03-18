import { FolderCard } from "./FolderCard";
import { PastaGerencial } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder } from "lucide-react";

interface FolderGridProps {
  pastas: PastaGerencial[] | undefined;
  isLoading: boolean;
  onFolderClick: (pasta: PastaGerencial) => void;
  onEditFolder?: (pasta: PastaGerencial) => void;
  onDeleteFolder?: (pasta: PastaGerencial) => void;
  onMoveFolder?: (pasta: PastaGerencial) => void;
}

export function FolderGrid({ 
  pastas, 
  isLoading, 
  onFolderClick, 
  onEditFolder, 
  onDeleteFolder,
  onMoveFolder 
}: FolderGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!pastas || pastas.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
      {pastas.map((pasta) => (
        <FolderCard
          key={pasta.id}
          pasta={pasta}
          onClick={() => onFolderClick(pasta)}
          onEdit={onEditFolder}
          onDelete={onDeleteFolder}
          onMove={onMoveFolder}
        />
      ))}
    </div>
  );
}
