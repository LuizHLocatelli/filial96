
import React from "react";
import { AlertCircle } from "lucide-react";

interface TaskListErrorProps {
  message: string;
}

export function TaskListError({ message }: TaskListErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <h3 className="font-medium text-lg">Erro ao carregar tarefas</h3>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
