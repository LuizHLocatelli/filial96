
import React from "react";

interface TaskListEmptyProps {
  type?: string;
}

export function TaskListEmpty({ type }: TaskListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-muted-foreground">
        {type ? `Nenhuma tarefa de ${type} encontrada` : "Nenhuma tarefa encontrada"}
      </p>
    </div>
  );
}
