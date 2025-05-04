
# Task Management System - Hooks Documentation

This document provides detailed information about the custom hooks used in the task management system, their parameters, return values, and usage patterns.

## useTasks

The `useTasks` hook is responsible for fetching and managing tasks based on filters.

### Parameters

```typescript
interface UseTasksProps {
  type?: string;    // Filter by task type (entrega, retirada, etc.)
  status?: string;  // Filter by task status (pendente, concluida, etc.)
}
```

### Return Value

```typescript
{
  tasks: Task[];                // Array of task objects
  isLoading: boolean;           // Loading state indicator
  error: string | null;         // Error message if fetch failed
  draggedTask: Task | null;     // Currently dragged task (for DnD)
  setDraggedTask: Function;     // Function to set dragged task
  handleStatusChange: Function; // Function to change task status
}
```

### Usage Example

```typescript
const { 
  tasks, 
  isLoading, 
  error,
  handleStatusChange 
} = useTasks({ 
  type: "entrega", 
  status: "pendente" 
});

// Render loading state
if (isLoading) return <TaskListSkeleton />;

// Render error state
if (error) return <TaskListError message={error} />;

// Render tasks
return tasks.map(task => <TaskCard task={task} />);
```

### Implementation Details

1. Fetches tasks from Supabase on component mount
2. Filters by type and status if provided
3. Sets up real-time subscription for database changes
4. Updates local state when changes occur
5. Provides function to update task status

## useTaskForm

The `useTaskForm` hook manages form state and submission for task creation and editing.

### Parameters

```typescript
interface UseTaskFormProps {
  taskId?: string;                 // ID for the task (required for editing)
  initialData?: Partial<Task>;     // Initial form values
  isEditMode?: boolean;            // Whether in edit mode
  onSuccess?: () => void;          // Callback on successful submission
  onCancel?: () => void;           // Callback on form cancellation
}
```

### Return Value

```typescript
{
  form: UseFormReturn;        // React Hook Form return object
  isSubmitting: boolean;      // Form submission state
  resetForm: () => void;      // Function to reset form values
  handleSubmit: Function;     // Form submission handler
  handleCancel: () => void;   // Form cancellation handler
}
```

### Usage Example

```typescript
const {
  form,
  isSubmitting,
  handleSubmit,
  handleCancel
} = useTaskForm({
  taskId,
  initialData,
  isEditMode,
  onSuccess: () => {
    setIsDialogOpen(false);
    refetchTasks();
  }
});

// In JSX
<Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)}>
    {/* Form fields */}
    <Button disabled={isSubmitting}>
      {isSubmitting ? "Salvando..." : "Salvar"}
    </Button>
  </form>
</Form>
```

### Implementation Details

1. Creates form with React Hook Form + Zod validation
2. Sets initial values from provided task data
3. Handles form submission to Supabase
4. Manages loading states and error handling
5. Logs activity after successful operations

## useTaskDialogs

The `useTaskDialogs` hook centralizes dialog management for task operations.

### Parameters

This hook doesn't take any parameters.

### Return Value

```typescript
{
  selectedTask: Task | null;            // Currently selected task
  isTaskDetailsOpen: boolean;           // Details dialog open state
  isEntregaDialogOpen: boolean;         // Delivery form dialog open state
  isRetiradaDialogOpen: boolean;        // Pickup form dialog open state 
  isEditMode: boolean;                  // Edit mode state
  taskId: string;                       // Current task ID
  setIsTaskDetailsOpen: Function;       // Details dialog setter
  setIsEntregaDialogOpen: Function;     // Delivery dialog setter
  setIsRetiradaDialogOpen: Function;    // Pickup dialog setter
  setIsEditMode: Function;              // Edit mode setter
  handleDialogOpen: Function;           // Dialog open handler
  handleTaskClick: Function;            // Task click handler
  handleEditTask: Function;             // Task edit handler
  handleCreateTask: Function;           // Task creation handler
  handleTaskSuccess: Function;          // Success handler
}
```

### Usage Example

```typescript
const {
  selectedTask,
  isTaskDetailsOpen,
  isEntregaDialogOpen,
  isEditMode,
  taskId,
  setIsTaskDetailsOpen,
  setIsEntregaDialogOpen,
  handleDialogOpen,
  handleTaskClick,
  handleEditTask,
  handleCreateTask
} = useTaskDialogs();

// Handle task click
<TaskList onTaskClick={handleTaskClick} />

// Open dialog for new task
<Button onClick={() => handleCreateTask('entrega')}>
  Nova Entrega
</Button>

// Render task form dialog
<TaskFormDialog
  open={isEntregaDialogOpen}
  onOpenChange={handleDialogOpen(setIsEntregaDialogOpen)}
  taskId={taskId}
  initialData={selectedTask || {type: "entrega"}}
  isEditMode={isEditMode}
/>
```

### Implementation Details

1. Centralizes dialog-related state in one place
2. Manages the currently selected task
3. Handles transitions between view/edit/create modes
4. Generates and tracks task IDs
5. Provides helper functions for common dialog operations

## useTaskCounts

The `useTaskCounts` hook provides statistics about task counts by type and status.

### Parameters

This hook doesn't take any parameters.

### Return Value

```typescript
{
  counts: {
    entrega: {
      total: number;
      pendente: number;
      em_andamento: number;
      concluida: number;
      aguardando_cliente: number;
    };
    retirada: {
      total: number;
      pendente: number;
      em_andamento: number;
      concluida: number;
      aguardando_cliente: number;
    };
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}
```

### Usage Example

```typescript
const { counts, isLoading } = useTaskCounts();

// In JSX
{isLoading ? (
  <Skeleton />
) : (
  <DashboardCard 
    title="Entregas Pendentes" 
    value={counts.entrega.pendente} 
  />
)}
```

### Implementation Details

1. Fetches all tasks from the database
2. Categorizes and counts them by type and status
3. Updates counts in real-time when database changes occur
4. Provides loading and error states for UI feedback

## Best Practices for Using These Hooks

1. **Composition**: Combine multiple hooks to build complex features
   ```typescript
   const { tasks } = useTasks({ type: "entrega" });
   const { handleCreateTask } = useTaskDialogs();
   ```

2. **Isolated Testing**: Each hook can be tested independently
   ```typescript
   test('useTasks returns filtered tasks', async () => {
     const { result } = renderHook(() => useTasks({ status: "pendente" }));
     // Assert results
   });
   ```

3. **Error Handling**: Always check for loading and error states
   ```typescript
   const { tasks, isLoading, error } = useTasks();
   
   if (isLoading) return <LoadingState />;
   if (error) return <ErrorState message={error} />;
   ```

4. **Real-Time Updates**: Leverage the automatic real-time updates
   ```typescript
   const { tasks } = useTasks(); // Will automatically update on changes
   ```

5. **Form State Management**: Use form reset and success callbacks
   ```typescript
   useTaskForm({
     onSuccess: () => {
       toast({ title: "Success!" });
       closeDialog();
     }
   });
   ```

This documentation provides a comprehensive overview of the hook system used in the task management application. For specific implementation details, please refer to the hook source files.
