# AGENTS.md - AI Assistant Development Guidelines

## Project Overview
This is a Vite + React + TypeScript application using shadcn/ui components, Tailwind CSS, and Supabase for backend services. It is a multi-module application covering moveis (furniture), moda (fashion), and crediario (loans).

## 1. Commands
- **Install**: `npm install`
- **Development**: `npm run dev` (port 8080)
- **Build**: `npm run build` (production) | `npm run build:dev` (dev with source maps)
- **Linting**: `npm run lint`
- **Testing (Watch All)**: `npm run test`
- **Testing (Run Once)**: `npm run test:run`
- **Testing (Single File)**: `npm run test -- <path/to/test.ts>` 
  *(Example: `npm run test -- src/types/shared/folgas.test.ts`)*

## 2. Code Style & TypeScript Guidelines
- **TypeScript**: Use `.ts` for utilities and `.tsx` for components. Project uses `noImplicitAny: false` and `strictNullChecks: false`.
- **Interfaces**: Prefer explicit `interface` declarations over `type` aliases for object shapes.
- **Component Patterns**: 
  - Default to **named exports** (e.g., `export function MyComponent()`).
  - Use `memo` for performance optimization where applicable.
  - Always include accessibility attributes (`role`, `tabIndex`, `aria-label`).
- **Imports**: Use the `@` alias (resolves to `/src`).
  - Order: React -> Router -> UI Components -> Internal Components -> Types -> Utilities.
- **Styling (Tailwind)**: 
  - Use shadcn/ui tokens (e.g., `bg-primary`, `text-muted-foreground`).
  - **Glassmorphism**: Use `.glass-card` (translucent backgrounds) or `.glass-overlay` (opaque floating elements like dropdowns/dialogs) defined in `src/styles/glassmorphism.css`.

## 3. Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `ToolCard.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useCardOperations.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatPhoneNumber.ts`)
- **Types/Interfaces**: `PascalCase` (e.g., `CardItem`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `CARD_COLORS`)

## 4. Architecture & Modularization
To ensure React Fast Refresh works correctly and to avoid `react-refresh/only-export-components` ESLint warnings:
- **Never mix Hooks and Components in the same file.**
- **Contexts**: Split into `types.ts`, `AuthContext.tsx`, `AuthProvider.tsx`, `useAuth.ts`, and an `index.ts` for public exports.
- **UI Components**: If adding utility functions (e.g., `cva` variants), split the component (`Button.tsx`), the variants (`buttonVariants.ts`), and the types (`types.ts`).

## 5. Standardized Dialogs (CRITICAL)
Always follow this 3-part structure for Dialogs to fix mobile scrolling issues. Do NOT use `StandardDialogContent`.
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-h-[85vh] overflow-y-auto flex flex-col p-0" hideCloseButton>
    <StandardDialogHeader icon={Bot} title="Title" onClose={() => onOpenChange(false)} />
    
    {/* CRITICAL: Use div with flex-1 and padding for scrollable content */}
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <form>...</form>
    </div>

    <StandardDialogFooter>
      <Button onClick={() => onOpenChange(false)}>Cancel</Button>
    </StandardDialogFooter>
  </DialogContent>
</Dialog>
```

## 6. State Management, Forms & Error Handling
- **State**: Use TanStack Query for server state, Context for global state, and `useState`/`useMemo` for local UI state.
- **Forms**: Use `react-hook-form` combined with `zod` for schema validation (`zodResolver`).
- **Error Handling**: Wrap async operations in `try/catch`. Log errors to `console.error` and use UI error boundaries.

## 7. Testing Standards
- **Framework**: Vitest + React Testing Library. 
- **Mocking**: Mock the Supabase client and Auth Contexts in tests (see `src/test/setup.ts`).
- **Structure**: Group tests using `describe` blocks and `it` for specific assertions. Place `*.test.ts/tsx` files alongside their source files.

## 8. Supabase & MCP Tools
- **Client**: All Supabase queries must use the client from `@/integrations/supabase/client`.
- **MCP Tools**: For agents, utilize tools like `supabase_list_tables`, `supabase_execute_sql`, `supabase_apply_migration`, etc., for database ops.
- **Edge Functions**: Located in `supabase/functions/` (Deno runtime). By default, they require JWT verification.