
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Task } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskTypeBadge } from "./TaskTypeBadge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Paperclip } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-brand-blue-300 transition-colors animate-scale-in"
      onClick={() => onClick(task)}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-medium text-sm line-clamp-1">{task.title}</h3>
          <div className="flex items-center gap-2">
            <TaskTypeBadge type={task.type} />
            <TaskStatusBadge status={task.status} />
          </div>
        </div>
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
        {task.attachments && task.attachments.length > 0 && (
          <div className="flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            <span>{task.attachments.length}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
