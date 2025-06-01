
import { useState } from "react";
import { Task } from "@/types";

export const useTaskDialogs = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const openDetailsDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setSelectedTask(null);
    setIsDetailsDialogOpen(false);
  };

  const setLoadingState = (loading: boolean) => {
    setIsLoading(loading);
  };

  return {
    isCreateDialogOpen,
    isDetailsDialogOpen,
    selectedTask,
    isLoading,
    openCreateDialog,
    closeCreateDialog,
    openDetailsDialog,
    closeDetailsDialog,
    setLoadingState,
  };
};
