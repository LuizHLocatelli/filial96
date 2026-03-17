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

## 2. Git Workflow & Deployment (CRITICAL)
**CRITICAL MANDATE**: As an AI assistant, you MUST **ALWAYS** commit, `git push`, and trigger the development deployment immediately after completing *any* task. Never wait for the user to ask you.

**REGRA OBRIGATÓRIA**: Sempre faça o commit, o "git push" e o acionamento do webhook de deploy imediatamente após concluir QUALQUER tarefa solicitada.

### Step 1: Commit and Push
To prevent "non-fast-forward" errors and ensure smooth deployments, **always pull remote changes with rebase** before pushing. Also, use the current branch instead of hardcoding `main`.

```bash
git add .
git commit -m "feat/fix: <description of what was done>"
BRANCH=$(git branch --show-current)
git fetch origin
git pull --rebase origin $BRANCH || echo "Pull failed (maybe no remote branch yet, or conflicts)"
git push -u origin $BRANCH
```

### Step 2: Trigger Deployment
After pushing, you MUST trigger the dev environment deployment by making a GET or POST request to the webhook URL:
```bash
curl -X GET http://72.60.241.201:3000/api/deploy/06a9bcd1e65574f36f1f0f1bb58b89f438412349046b94d7
```

**Do NOT** under any circumstances finish a task and leave changes uncommitted, unpushed, or undeployed. This ensures work is preserved, team members have access to the latest code, and the dev environment reflects your changes immediately.

## 3. Code Style & TypeScript Guidelines
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
ALL dialog windows in the application MUST use `DialogScrollableContainer` to ensure excellent responsiveness and fix mobile scrolling issues. Do NOT use `StandardDialogContent` or manually build scrollable `div` structures.

### Dialog Structure
Always follow this 3-part structure for Dialogs:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  {/* CRITICAL: Use max-h-[75dvh] sm:max-h-[75vh] to prevent it from going offscreen on mobile */}
  <DialogContent className="max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col p-0" hideCloseButton>
    <StandardDialogHeader icon={Bot} title="Title" onClose={() => onOpenChange(false)} />
    
    {/* CRITICAL: ALL dialogs must use DialogScrollableContainer for their main content */}
    <DialogScrollableContainer>
      <form>...</form>
    </DialogScrollableContainer>

    <StandardDialogFooter>
      <Button onClick={() => onOpenChange(false)}>Cancel</Button>
    </StandardDialogFooter>
  </DialogContent>
</Dialog>
```

**IMPORTANT**: The `DialogScrollableContainer` automatically calculates maxHeight (e.g., `calc(75dvh - 260px)`) to reserve sufficient space for the header and footer. This ensures the scrolling behavior works flawlessly and that buttons in `StandardDialogFooter` are never cut off, even on small mobile screens.

## 6. State Management, Forms & Error Handling
- **State**: Use TanStack Query for server state, Context for global state, and `useState`/`useMemo` for local UI state.
- **Forms**: Use `react-hook-form` combined with `zod` for schema validation (`zodResolver`).
- **Error Handling**: Wrap async operations in `try/catch`. Log errors to `console.error` and use UI error boundaries.

## 7. Testing Standards
- **Framework**: Vitest + React Testing Library. 
- **Mocking**: Mock the Supabase client and Auth Contexts in tests (see `src/test/setup.ts`).
- **Structure**: Group tests using `describe` blocks and `it` for specific assertions. Place `*.test.ts/tsx` files alongside their source files.

## 8. Supabase & MCP Tools
- **Client**: All Supabase queries in the application code must use the client from `@/integrations/supabase/client`.
- **MCP Tools (CRITICAL)**: Whenever an agent needs to interact with Supabase (reading/writing data, checking schema, applying migrations, logs, etc.), it **MUST ALWAYS** use the Supabase MCP tools (e.g., `supabase_list_tables`, `supabase_execute_sql`, `supabase_apply_migration`, etc.). **Do NOT** attempt to write custom scripts or workarounds to interact with the database; MCP is strictly mandatory for agents.
- **Edge Functions**: Located in `supabase/functions/` (Deno runtime). By default, they require JWT verification.

## 9. Role-Based Access Control (RBAC) & Routing
The application uses a granular Role-Based Access Control system to manage what pages, tabs, and tools users can access.

- **Role Definitions**: User roles (e.g., `gerente`, `freteiro`, `consultor_moveis`) are stored in the Supabase `profiles` table.
- **Permission Hooks**: Always use `useRolePermissions()` to verify if a user has access to a specific tool or module. The `hasAccessToTool("permission_key")` method determines boolean access. (Note: The `gerente` role automatically returns `['*']` for full access).
- **Route Protection**: Wrap routes in `<ProtectedRoute requiredPermission="permission_key">`. If a user lacks the specified permission, the component intercepts navigation and intelligently redirects them to their first allowed navigation tab or `/perfil` to avoid infinite loops.
- **Dynamic Tabs**: Internal page tabs (like the sub-tabs in the "Móveis" page) should conditionally render based on the same permission keys. Always ensure the default active tab is computed dynamically by selecting the first tab the user has permission to see, rather than hardcoding a default tab.