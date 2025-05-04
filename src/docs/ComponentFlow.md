
# Task Management System - Component Flow Documentation

## User Interface Flow

This document describes the interaction flow between components in the task management system.

### Task Creation Flow

```
User Action: Click "New Task" button
↓
TaskPage (Cobrancas, Garantias, etc.)
↓
Opens TaskFormDialog
↓
TaskFormContent renders form fields
↓
User fills form and submits
↓
useTaskForm hook processes submission
↓
Supabase client sends data to database
↓
Real-time subscription triggers UI update
↓
TaskList component refreshes with new task
```

### Task Edit Flow

```
User Action: Click edit icon on TaskCard
↓
TaskList passes edit event to parent page
↓
Page component sets selected task and edit mode
↓
Opens TaskFormDialog with pre-filled data
↓
User edits and submits form
↓
useTaskForm updates task in database
↓
Real-time subscription triggers UI update
↓
TaskList component refreshes with updated task
```

### Task View Details Flow

```
User Action: Click on TaskCard
↓
TaskList passes click event to parent page
↓
Page sets selected task
↓
Opens TaskDetailsDialog
↓
TaskDetailsContent displays task information
↓
TaskDetailsActions provides edit/delete options
```

### Task Deletion Flow

```
User Action: Click delete button (either on card or details dialog)
↓
Confirmation dialog appears
↓
User confirms deletion
↓
Parent component calls delete handler
↓
Supabase client removes task from database
↓
Real-time subscription triggers UI update
↓
TaskList component refreshes without the deleted task
↓
Toast notification confirms deletion
```

## Data Flow Diagram

```
┌─────────────────┐        ┌──────────────┐
│ Page Components │◄──────►│ Task Dialogs │
└────────┬────────┘        └──────┬───────┘
         │                        │
         ▼                        ▼
┌─────────────────┐        ┌──────────────┐
│   Custom Hooks  │◄──────►│   Form Hooks │
└────────┬────────┘        └──────┬───────┘
         │                        │
         ▼                        ▼
┌─────────────────┐        ┌──────────────┐
│ Supabase Client │◄──────►│ Database     │
└─────────────────┘        └──────────────┘
```

## State Management

The task management system uses React's useState and custom hooks for state management:

1. **Task State:**
   - Stored in the `useTasks` hook
   - Updated via real-time subscriptions
   - Filtered based on type and status

2. **UI State:**
   - Dialog open/closed states
   - Selected task for viewing/editing
   - Edit mode flag
   - Form submission state

3. **Form State:**
   - Managed by React Hook Form
   - Validation through Zod schema
   - Initial values set from selected task

## Component Responsibilities

### Page Components
- Orchestrate the overall flow
- Handle dialog state
- Manage selected task state

### Dialog Components
- Present UI for creating/editing/viewing tasks
- Handle dialog actions (close, submit)
- Delegate form handling to hooks

### List Components
- Display tasks in a formatted grid
- Handle filtering and sorting
- Provide interactive elements for task management

### Form Components
- Collect and validate user input
- Format data for submission
- Provide feedback on validation errors

## Event Handling

Most interactions are handled through callback functions passed down as props:

- `onTaskClick`: When a task card is clicked
- `onEditTask`: When edit action is triggered
- `onDeleteTask`: When delete action is triggered
- `onOpenChange`: When dialogs open/close
- `onSuccess`: When form submission succeeds

This callback pattern allows for flexible component reuse while maintaining clear data flow.
