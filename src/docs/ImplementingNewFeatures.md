# Adding New Features to the Task Management System

This guide explains how to implement new features in the task management system, including best practices and common patterns.

## Adding a New Task Type

To add a new task type to the system (e.g., "inventario" for inventory tasks):

### 1. Update Type Definitions

First, update the `TaskType` type in `src/types/index.ts`:

```typescript
export type TaskType = 'entrega' | 'retirada' | 'montagem' | 'garantia' | 
                       'organizacao' | 'cobranca' | 'inventario';
```

### 2. Create a New Page Component

Create a new file `src/pages/Inventario.tsx`:

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskFormDialog } from "@/components/tasks/dialogs/TaskFormDialog";
import { TaskDetailsDialog } from "@/components/tasks/TaskDetailsDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";

export default function Inventario() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [taskId, setTaskId] = useState<string>("");
  const { toast } = useToast();

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      // Se estiver fechando o diálogo e não estamos no modo de edição
      if (!isEditMode) {
        setSelectedTask(null);
      }
      
      setIsDialogOpen(false);
      return;
    }
    
    if (!isEditMode) {
      // Generate a new task ID when dialog opens for new task
      setTaskId(uuidv4());
    }
    
    setIsDialogOpen(open);
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskId(task.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
      
      if (error) throw error;
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso."
      });
      
      setSelectedTask(null);
      setIsTaskDetailsOpen(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventário</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie tarefas de inventário da loja.
          </p>
        </div>
        <Button 
          className="flex items-center gap-2 w-full sm:w-auto justify-center" 
          onClick={() => {
            setIsEditMode(false);
            setSelectedTask(null);
            handleDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova Tarefa de Inventário
        </Button>
      </div>
      
      {/* Task creation/edit dialog */}
      <TaskFormDialog 
        open={isDialogOpen}
        onOpenChange={handleDialogOpen}
        taskId={taskId}
        initialData={selectedTask || undefined}
        isEditMode={isEditMode}
        onSuccess={() => {
          setSelectedTask(null);
          setIsEditMode(false);
        }}
      />
      
      {/* Task details dialog */}
      <TaskDetailsDialog
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        task={selectedTask}
        onEdit={() => {
          setIsEditMode(true);
          setIsTaskDetailsOpen(false);
          setIsDialogOpen(true);
        }}
        onDelete={handleDeleteTask}
      />
      
      {/* Task list with tabs for filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 flex overflow-x-auto pb-1 sm:pb-0">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          <TaskList 
            type="inventario" 
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="pendente" className="mt-0">
          <TaskList 
            type="inventario" 
            status="pendente"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="em_andamento" className="mt-0">
          <TaskList 
            type="inventario" 
            status="em_andamento"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="concluida" className="mt-0">
          <TaskList 
            type="inventario" 
            status="concluida"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 3. Update Task Type Badge

Modify `src/components/tasks/TaskTypeBadge.tsx` to include the new task type:

```typescript
import { Badge } from "@/components/ui/badge";
import { TaskType } from "@/types";

interface TaskTypeBadgeProps {
  type: TaskType;
}

export function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  switch (type) {
    case "entrega":
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Entrega</Badge>;
    case "retirada":
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Retirada</Badge>;
    case "montagem":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Montagem</Badge>;
    case "garantia":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Garantia</Badge>;
    case "organizacao":
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Organização</Badge>;
    case "cobranca":
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cobrança</Badge>;
    case "inventario":
      return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Inventário</Badge>;
    default:
      return <Badge variant="outline">Tarefa</Badge>;
  }
}
```

### 4. Add to Navigation

Update the application's navigation to include the new task type.

## Creating a New Dialog Component

To implement a new dialog for task operations:

### 1. Define Component Structure

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MyNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Additional props
}

export function MyNewDialog({ open, onOpenChange }: MyNewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Integrate with Task System

Connect to the task system using existing hooks:

```typescript
import { useTaskForm } from "@/hooks/useTaskForm";

// ...

const { form, handleSubmit } = useTaskForm({
  taskId,
  initialData,
  onSuccess
});
```

## Creating a Custom Hook

To implement a new hook for the task system:

### 1. Define Hook Structure

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseMyFeatureProps {
  // Props
}

export function useMyFeature({ /* props */ }: UseMyFeatureProps = {}) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch data from Supabase
        const { data: result, error } = await supabase
          .from("my_table")
          .select("*");
        
        if (error) {
          throw error;
        }
        
        setData(result);
      } catch (error) {
        setError("Failed to load data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Optional: Set up real-time subscription
    const channel = supabase
      .channel('my-table-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'my_table' }, payload => {
        fetchData();
      })
      .subscribe();
    
    return () => {
      // Cleanup subscription
      supabase.removeChannel(channel);
    };
  }, [/* dependencies */]);
  
  return { data, isLoading, error /* other values */ };
}
```

### 2. Implement Hook Logic

Add specific functionality for your feature while following patterns established in existing hooks.

## Extending Form Components

To add new fields to the task form:

### 1. Update Schema

Modify `src/components/tasks/form/TaskFormSchema.ts` to include new fields:

```typescript
import { z } from "zod";

export const taskFormSchema = z.object({
  // Existing fields
  invoiceNumber: z.string().optional(),
  observation: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  products: z.string().optional(),
  purchaseDate: z.date().optional(),
  expectedArrivalDate: z.date().optional(),
  expectedDeliveryDate: z.date().optional(),
  clientCpf: z.string().optional(),
  
  // New fields
  newField: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
```

### 2. Add Form Fields

Update `src/components/tasks/form/TaskFormContent.tsx` to include new input fields:

```typescript
import { Control } from "react-hook-form";
import { InputField } from "./InputField";

interface TaskFormContentProps {
  control: Control<any>;
}

export function TaskFormContent({ control }: TaskFormContentProps) {
  return (
    <div className="space-y-4">
      {/* Existing fields */}
      
      {/* New fields */}
      <InputField 
        control={control}
        name="newField"
        label="New Field Label"
        placeholder="Placeholder text"
      />
    </div>
  );
}
```

### 3. Update Database Mapping

Modify `useTaskForm.ts` to map the new field to the database:

```typescript
// In the handleSubmit function
const taskData = {
  // Existing fields
  invoice_number: data.invoiceNumber,
  description: data.observation,
  status: data.status,
  priority: data.priority,
  client_name: data.clientName,
  client_phone: data.clientPhone,
  client_address: data.clientAddress,
  client_cpf: data.clientCpf,
  notes: data.products,
  purchase_date: data.purchaseDate?.toISOString() || null,
  expected_arrival_date: data.expectedArrivalDate?.toISOString() || null,
  expected_delivery_date: data.expectedDeliveryDate?.toISOString() || null,
  
  // New field
  new_field: data.newField || null,
};
```

## Implementing Task Filtering

To add a new filtering mechanism:

### 1. Add State to Component

```typescript
import { useState } from "react";

// ...

const [filterValue, setFilterValue] = useState<string | null>(null);
```

### 2. Modify useTasks Call

```typescript
import { useTasks } from "@/hooks/useTasks";

// ...

const { tasks } = useTasks({ 
  type: "entrega", 
  status: "pendente",
  // New filter parameter
  customFilter: filterValue
});
```

### 3. Update Hook Implementation

Modify the `useTasks` hook to handle the new filter:

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";

interface UseTasksProps {
  type?: string;
  status?: string;
  customFilter?: string | null; // New filter
}

export function useTasks({ type, status, customFilter }: UseTasksProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (type) {
          query = query.eq("type", type);
        }

        if (status) {
          query = query.eq("status", status);
        }
        
        // New filter implementation
        if (customFilter) {
          query = query.ilike("some_column", `%${customFilter}%`);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setTasks(data as Task[]);
      } catch (error) {
        setError("Failed to load tasks");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [type, status, customFilter]);

  return { tasks, isLoading, error };
}
```

## Adding Task Actions

To add a new action for tasks:

### 1. Create Action Function

```typescript
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const handleSpecialAction = async (task: Task) => {
  const { toast } = useToast();
  try {
    // Perform action logic
    console.log("Performing special action for task:", task);
    
    toast({
      title: "Action performed",
      description: "The special action was successfully completed."
    });
  } catch (error) {
    console.error('Error performing action:', error);
    toast({
      title: "Error",
      description: "Could not perform the action.",
      variant: "destructive"
    });
  }
};
```

### 2. Add UI Element

```typescript
import { Button } from "@/components/ui/button";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div>
      {/* Task details */}
      
      <Button 
        onClick={() => handleSpecialAction(task)}
        variant="outline"
      >
        Special Action
      </Button>
    </div>
  );
}
```

## Best Practices

1. **Follow Established Patterns**: Maintain consistency with existing components
2. **Keep Components Small**: Split large components into smaller, focused parts
3. **Use Type Safety**: Define proper TypeScript interfaces for all components
4. **Handle Loading & Error States**: Always account for loading and error conditions
5. **Real-time Updates**: Use Supabase subscriptions for real-time data
6. **Toast Notifications**: Provide feedback for user actions
7. **Form Validation**: Use Zod schemas for consistent validation
8. **Responsive Design**: Ensure all components work on mobile devices
9. **Accessibility**: Maintain proper focus management in dialogs

## Testing New Features

1. **Manual Testing**: Verify feature works as expected in the UI
2. **Edge Cases**: Test with empty states, large datasets, and error conditions
3. **Real-time Behavior**: Verify changes from one client appear in others
4. **Mobile View**: Test responsiveness on different screen sizes

## Troubleshooting Common Issues

1. **Form Not Submitting**: Check form validation and error messages
2. **Data Not Updating**: Verify Supabase queries and real-time subscription
3. **Dialog Issues**: Check open/close state management
4. **Type Errors**: Ensure proper TypeScript types for all components

By following these guidelines, you can extend the task management system while maintaining consistency and quality across the application.
