
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Board } from "../types";

interface BoardHeaderProps {
  board: Board | null;
  onAddColumn: () => void;
}

export function BoardHeader({ board, onAddColumn }: BoardHeaderProps) {
  if (!board) return null;
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium">{board.name}</h3>
        <p className="text-sm text-muted-foreground">{board.description}</p>
      </div>
      <Button onClick={onAddColumn}>
        <Plus className="h-4 w-4 mr-1" />
        Nova Coluna
      </Button>
    </div>
  );
}
