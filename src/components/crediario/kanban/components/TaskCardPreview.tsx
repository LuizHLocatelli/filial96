
import { DragOverlay, useDndContext } from "@dnd-kit/core";
import { TaskCard } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskCardPreviewProps {
  card: TaskCard;
}

export function TaskCardPreview({ card }: TaskCardPreviewProps) {
  const { active } = useDndContext();
  
  if (!active) {
    return null;
  }
  
  // Define priority styling
  const getPriorityStyle = () => {
    switch (card.priority) {
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "media":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "";
    }
  };
  
  return (
    <DragOverlay>
      <div
        style={{ 
          background: card.background_color || "white",
          width: "270px" // Fixed width to match the column card width 
        }}
        className={cn(
          "p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700 rotate-3"
        )}
      >
        <div className="space-y-1">
          <Badge variant="outline" className={getPriorityStyle()}>
            {card.priority === "baixa" ? "Baixa" : card.priority === "media" ? "Média" : "Alta"}
          </Badge>
          
          <h3 className="font-medium text-sm line-clamp-1">{card.title}</h3>
          
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {card.description}
            </p>
          )}
        </div>
      </div>
    </DragOverlay>
  );
}
