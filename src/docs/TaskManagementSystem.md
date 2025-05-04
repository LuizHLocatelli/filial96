
# Task Management System Documentation

## Overview

The task management system provides a comprehensive solution for tracking various types of tasks within the organization. It supports different task types including deliveries, pickups, installations, warranties, store organization, and collections. The system features task creation, editing, viewing details, filtering, and status tracking.

## Core Components

### 1. Task Types

All task types are defined in the central `Task` type definition (`src/types/index.ts`):

```typescript
export type TaskType = 'entrega' | 'retirada' | 'montagem' | 'garantia' | 'organizacao' | 'cobranca';
```

Each type represents a different operational area:
- `entrega`: Deliveries to customers
- `retirada`: Pick-ups from customers
- `montagem`: Furniture assembly/installation
- `garantia`: Warranty claims processing
- `organizacao`: Store organization tasks
- `cobranca`: Collection of overdue payments

### 2. Task Status Flow

Tasks follow a defined status workflow:

```typescript
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando_cliente';
```

- `pendente`: Pending/Not started
- `em_andamento`: In progress
- `concluida`: Completed
- `cancelada`: Canceled
- `aguardando_cliente`: Waiting for customer

## Component Hierarchy

### Page Components

Each task type has a dedicated page component:
- `Cobrancas.tsx`: Management of collection tasks
- `Garantias.tsx`: Management of warranty processing tasks
- `Montagens.tsx`: Management of installation tasks
- `Organizacao.tsx`: Management of store organization tasks
- `EntregasRetiradas.tsx`: Combined management of deliveries and pickups

These page components follow a similar structure:
1. State management for dialogs, selected tasks, and edit mode
2. Task operation handlers (create, edit, delete)
3. UI implementation with filters and task list display

### Main UI Components

#### 1. Task List (`TaskList.tsx`)

Displays tasks in a grid layout with filtering capabilities by type and status. Features:
- Filtering by task type and status
- Handling clicks for viewing task details
- Callbacks for editing and deleting tasks
- Support for drag-and-drop functionality

#### 2. Task Card (`TaskCard.tsx`)

Individual task card displaying:
- Task title and description
- Task type badge
- Status badge
- Creation time
- Edit and delete action buttons

#### 3. Dialog Components

##### TaskFormDialog (`components/tasks/dialogs/TaskFormDialog.tsx`)

A dialog for creating and editing tasks:
- Handles both creation and edit modes
- Uses a form with validation
- Submits data to the Supabase backend

##### TaskDetailsDialog (`TaskDetailsDialog.tsx`)

Displays detailed information about a specific task:
- Shows all task fields including client information
- Provides actions for editing or deleting the task

## Data Flow and State Management

### 1. Task Data Flow

The task management system follows this data flow:

1. User creates/edits a task via the `TaskFormDialog`
2. Form data is validated and processed by `useTaskForm` hook
3. Data is sent to Supabase using the client
4. Real-time subscriptions update UI when data changes
5. Tasks are displayed in the `TaskList` component

### 2. Custom Hooks

#### useTasks (`useTasks.ts`)

Responsible for fetching and managing tasks:
- Fetches tasks based on type and status filters
- Handles real-time updates via Supabase subscriptions
- Manages task status changes through drag-and-drop

#### useTaskForm (`useTaskForm.ts`)

Manages the task form state and submission:
- Form initialization and validation
- Task data submission (create/update)
- Error handling and success callbacks

#### useTaskDialogs (`useTaskDialogs.ts`)

Centralized dialog state management for:
- Opening/closing task dialogs
- Switching between creation and edit modes
- Handling selected task state

## Backend Integration

The system integrates with Supabase for data storage and real-time updates:

### Database Schema

Tasks are stored in the `tasks` table with the following key fields:
- `id`: Unique identifier (UUID)
- `type`: Task type
- `title`: Task title
- `description`: Detailed description
- `status`: Current status
- `priority`: Task priority (baixa/media/alta)
- Client information fields (name, phone, address, etc.)
- Dates (created_at, due_date, completed_at, etc.)
- Invoice and product information

### Real-time Updates

The system leverages Supabase's real-time capabilities to update the UI when data changes:
- Subscription to the `tasks` table changes (insert, update, delete)
- Toast notifications for informing users about changes

## Adding New Task Types

To add a new task type to the system:

1. Extend the `TaskType` type in `src/types/index.ts`
2. Create a new page component for the task type
3. Update the `TaskTypeBadge` component to support the new type
4. Add routing for the new page in `AppRoutes.tsx`

## Testing and Debugging

When debugging issues with the task management system:
- Check the browser console for detailed logs
- Verify form validations in `TaskFormSchema.ts`
- Review the Supabase database for data consistency
- Test the real-time functionality by making changes from different sessions

## Common Issues and Solutions

### Form Submission Issues
- Check if all required fields are properly filled
- Verify Supabase connection and permissions
- Inspect console logs for detailed error messages

### UI Update Issues
- Ensure real-time subscription is properly set up
- Check component re-rendering logic
- Verify the `tasks` state is correctly updated

### Task Status Changes
- Check the `handleStatusChange` function in `useTasks.ts`
- Verify Supabase permissions for updating tasks
- Ensure status values are valid according to the `TaskStatus` type

## Component Reference

### Key Interfaces and Types

```typescript
// Task type definition
interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  observation?: string;
  status: TaskStatus;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  priority: 'baixa' | 'media' | 'alta';
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientCpf?: string;
  notes?: string;
  products?: string;
  purchaseDate?: string;
  expectedArrivalDate?: string;
  expectedDeliveryDate?: string;
  invoiceNumber?: string;
}
```

This documentation provides an overview of the task management system's architecture, components, and functionality. For more specific implementation details, please refer to the corresponding source files.
