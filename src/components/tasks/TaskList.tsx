
import { useState } from "react";
import { Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { TaskListSkeleton } from "./TaskListSkeleton";
import { TaskListError } from "./TaskListError";
import { TaskListEmpty } from "./TaskListEmpty";
import { useTasks } from "@/hooks/useTasks";

interface TaskListProps {
  type?: string;
  status?: string;
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  className?: string;
  refreshKey?: number; // Add refreshKey prop for forcing refetch
}

export function TaskList({ 
  type, 
  status, 
  onTaskClick, 
  onEditTask, 
  onDeleteTask,
  className = "",
  refreshKey = 0
}: TaskListProps) {
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const {
    tasks,
    isLoading,
    error,
    draggedTask,
    setDraggedTask,
    handleStatusChange
  } = useTasks({ type, status, refreshKey });

  // Handle task click
  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // Handle task edit
  const handleEditTask = (task: Task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  // Handle task delete
  const handleDeleteTask = (task: Task) => {
    if (onDeleteTask) {
      onDeleteTask(task);
    } else {
      setTaskToDelete(task);
      setShowDeleteDialog(true);
    }
  };

  // Handle drag start
  const handleDragStart = (task: Task, event: React.DragEvent) => {
    setDraggedTask(task);
    event.dataTransfer.setData('text/plain', task.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  if (isLoading) {
    return <TaskListSkeleton className={className} />;
  }

  if (error) {
    return <TaskListError message={error} />;
  }

  if (tasks.length === 0) {
    return <TaskListEmpty type={type} />;
  }

  return (
    <>
      <div 
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}
        onDragOver={handleDragOver}
      >
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(task, e)}
          >
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={onTaskClick ? onTaskClick : handleTaskClick}
              onEdit={onEditTask ? handleEditTask : undefined}
              onDelete={onDeleteTask ? handleDeleteTask : (task) => {
                setTaskToDelete(task);
                setShowDeleteDialog(true);
              }}
              isDragging={draggedTask?.id === task.id}
            />
          </div>
        ))}
      </div>
      
      <DeleteTaskDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        taskToDelete={taskToDelete}
        onDeleteComplete={() => setTaskToDelete(null)}
      />
    </>
  );
}
