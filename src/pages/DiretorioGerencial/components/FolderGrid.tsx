import { memo } from "react";
import { FolderCard } from "./FolderCard";
import { PastaComCounts } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface FolderGridProps {
  pastas: PastaComCounts[] | undefined;
  isLoading: boolean;
  onFolderClick: (pasta: PastaComCounts) => void;
  onEditFolder?: (pasta: PastaComCounts) => void;
  onDeleteFolder?: (pasta: PastaComCounts) => void;
  onMoveFolder?: (pasta: PastaComCounts) => void;
}

export const FolderGrid = memo(function FolderGrid({
  pastas,
  isLoading,
  onFolderClick,
  onEditFolder,
  onDeleteFolder,
  onMoveFolder,
}: FolderGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!pastas || pastas.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
});
