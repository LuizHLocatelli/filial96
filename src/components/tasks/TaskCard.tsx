
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Task } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskTypeBadge } from "./TaskTypeBadge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Edit, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, onEdit, onDelete, isDragging }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(task);
  };

  return (
    <Card 
      className={`cursor-pointer hover:border-brand-blue-300 transition-colors ${isDragging ? 'opacity-50' : 'animate-scale-in'}`}
      onClick={() => onClick(task)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      draggable="true"
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-medium text-sm line-clamp-1">{task.title}</h3>
          <div className="flex items-center gap-2">
            <TaskTypeBadge type={task.type} />
            <TaskStatusBadge status={task.status} />
          </div>
        </div>
        {showActions && (
          <div className="flex items-center space-x-1">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
        {task.clientName && (
          <p className="text-xs mt-2 text-brand-blue-700 font-medium">
            Cliente: {task.clientName}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(task.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
