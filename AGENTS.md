# AGENTS.md - Development Guidelines

This document provides guidelines for AI agents working on this codebase.

## Project Overview

This is a Vite + React + TypeScript application using shadcn/ui components and Tailwind CSS. It includes Supabase integration for backend services and is a multi-module application serving furniture (moveis), fashion (moda), and loan (crediario) business sectors.

## Build, Lint, and Test Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev          # Start dev server on port 8080
```

### Build
```bash
npm run build        # Production build
npm run build:dev    # Development build with source maps
npm run analyze      # Bundle analysis (outputs to bundle-analysis.html)
```

### Linting
```bash
npm run lint         # Run ESLint on all files
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once and exit
```

To run a single test file, use:
```bash
npm run test -- src/types/shared/folgas.test.ts
```

### Other Commands
```bash
npm run preview      # Preview production build
npm run knip         # Check for unused dependencies/files
```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all files (`.ts` for utilities, `.tsx` for components)
- Enable `noImplicitAny: false` and `strictNullChecks: false` in tsconfig
- Prefer explicit interfaces over type aliases for object shapes
- Use JSDoc comments for utility functions explaining purpose and parameters

### Component Patterns
- Use `memo` from React for performance optimization on components
- Default to named exports for components
- Use TypeScript interfaces for props (e.g., `interface ToolCardProps`)
- Include proper accessibility attributes (role, tabIndex, aria-label)
- Use consistent file naming: `PascalCase.tsx` for components, `camelCase.ts` for utilities

### Imports and Path Aliases
Use the `@` alias for imports (configured to resolve to `/src`):
```typescript
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
```

Import order for components:
1. React imports
2. Router imports
3. Third-party UI components
4. Internal component imports
5. Type imports
6. Utility imports

### Styling (Tailwind CSS)
- Use shadcn/ui design tokens: `text-foreground`, `text-muted-foreground`, `bg-primary`, etc.
- Apply responsive breakpoints: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- Use `group` and `group-hover` for hover effects on parent-child elements
- Custom colors: `brand-green-*` and `brand-gray-*` shades available
- Custom animations: `fade-in`, `fade-out`, `scale-in`, `bounce-in`, `slide-up`, `pulse-success`

### Naming Conventions
- **Components**: PascalCase (e.g., `ToolCard`, `DeleteSaleDialog`)
- **Hooks**: camelCase with "use" prefix (e.g., `useCardOperations`, `useToast`)
- **Utilities**: camelCase (e.g., `formatPhoneNumber`, `getTextColor`)
- **Types/Interfaces**: PascalCase (e.g., `CardItem`, `ToolCardProps`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `cardColors`)

### Error Handling
- Use try/catch for async operations
- Log errors with `console.error('Error message:', error)`
- Return false or throw specific errors from utility functions
- Use error boundaries for component-level error handling

### State Management
- Use React Context for global state (e.g., `useAuth`, `useToast`)
- Use TanStack Query (`@tanstack/react-query`) for server state
- Use local state with `useState` for UI state
- Memoize expensive computations with `useMemo` and `useCallback`

### Data Validation
- Use Zod for form validation with `react-hook-form`
- Use `supabase-js` for database operations with proper error handling
- Validate Brazilian phone numbers and formatting utilities available in `@/utils/phoneFormatter`

### Database (Supabase)
- All Supabase queries use the client from `@/integrations/supabase/client`
- Mock Supabase in tests using `vi.mock` (see `src/test/setup.ts`)
- Use Supabase MCP tools for migrations: `supabase_apply_migration`, `supabase_execute_sql`

### Form Validation (Zod + React Hook Form)
Common patterns for form validation:
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: '', email: '', phone: '' },
});
```

### Testing
- Use Vitest with Testing Library (React Testing Library + jest-dom)
- Test files: `*.test.ts` or `*.test.tsx` in same directory as source
- Mock Supabase client and auth context in tests
- Structure tests with `describe` blocks for type/file and `it` for specific assertions

#### Test Example
```typescript
import { vi } from 'vitest';
import { supabase } from '@/test/setup';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({ data: [], error: null }),
      insert: vi.fn().mockReturnValue({ data: [], error: null }),
    })),
  },
}));
```

### Supabase MCP Tools
Available tools for database operations:
- `supabase_list_tables` - List all tables in database
- `supabase_execute_sql` - Execute raw SQL queries
- `supabase_apply_migration` - Apply DDL migrations
- `supabase_list_migrations` - List applied migrations
- `supabase_get_logs` - Get logs (api, postgres, auth, storage, etc.)
- `supabase_get_advisors` - Get security/performance advisories
- `supabase_list_edge_functions` - List edge functions
- `supabase_deploy_edge_function` - Deploy edge functions

### Supabase Edge Functions
- Located in `supabase/functions/` with Deno runtime
- Configure with `deno.json` and `import_map.json`
- Deploy using `supabase_deploy_edge_function` MCP tool
- Edge functions require JWT verification by default (can be disabled with `verify_jwt: false`)

## Architecture

### Directory Structure
```
src/
├── components/     # React components (organized by feature)
├── pages/          # Page-level components (Moveis, Moda, Crediario)
├── hooks/          # Custom React hooks
├── contexts/       # React Context providers
├── utils/          # Utility functions
├── lib/            # Library code (utils.ts, supabase client)
├── types/          # TypeScript type definitions
├── integrations/   # External service integrations
└── test/           # Test setup and configuration
```

### Component Organization
- UI components in `@/components/ui` (shadcn/base)
- Feature components in `@/components/{feature}/`
- Pages in `@/pages/{ModuleName}/`

## Editor Configuration

The project uses:
- ESLint for code quality
- TypeScript for type safety
- Prettier (via shadcn-cli) for formatting
- Tailwind CSS class sorting via shadcn

## Environment Variables

See `.env` for required variables. Supabase keys are managed via Claude settings.

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Dialog Standards

This project uses a standardized dialog pattern based on the "Assistentes de IA" dialogs. All dialogs should follow this structure for consistency:

### ⚠️ IMPORTANTE: Problema de Scroll Corrigido

**Problema**: As dialogs não permitiam rolagem vertical no mobile/devido a incompatibilidades com Radix UI Dialog + CSS.

**Solução**: Usar um `<div>` simples com `overflow-y-auto` ao invés do `StandardDialogContent` para conteúdo rolável:

```tsx
// ❌ NÃO USE (não funciona corretamente no mobile)
<StandardDialogContent>
  <FormContent />
</StandardDialogContent>

// ✅ USE ASSIM (funciona perfeitamente)
<div className="flex-1 overflow-y-auto">
  <FormContent />
</div>
```

### StandardDialog Components

Use the reusable components from `@/components/ui/standard-dialog`:

```typescript
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";
// Note: StandardDialogContent está com problemas de scroll
```

### Dialog Structure

Every dialog should follow this 3-part structure:

1. **Header** - With gradient background, icon, title, and close button (use `StandardDialogHeader`)
2. **Content** - Scrollable area with form/content (use `<div className="flex-1 overflow-y-auto">`)
3. **Footer** - Fixed at bottom with action buttons (use `StandardDialogFooter`)

### Example Usage (Correto)

**IMPORTANTE**: O `DialogContent` deve ter `overflow-y-auto` para funcionar corretamente:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent
    className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
    hideCloseButton
  >
    <StandardDialogHeader
      icon={Bot}
      iconColor="primary" // primary | red | amber | blue | green
      title="Novo Assistente"
      description="Descrição opcional do diálogo"
      onClose={() => onOpenChange(false)}
      loading={loading}
    />

    {/* ⚠️ Use div com overflow-y-auto para conteúdo rolável */}
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <FormContent />
    </div>

    <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </StandardDialogFooter>
  </DialogContent>
</Dialog>
```

### ⚠️ IMPORTANTE: Padding Obrigatório no Conteúdo

**Problema comum**: O conteúdo interno da dialog estava grudado nas bordas, sem espaçamento adequado.

**Solução**: A `<div>` com `flex-1 overflow-y-auto` **DEVE** ter padding `p-4 sm:p-6`:

```tsx
// ❌ INCORRETO - Sem padding, conteúdo grudado nas bordas
<div className="flex-1 overflow-y-auto">
  <form>...</form>
</div>

// ✅ CORRETO - Com padding adequado
<div className="flex-1 overflow-y-auto p-4 sm:p-6">
  <form>...</form>
</div>
```

**Por que isso é necessário:**
- O `DialogContent` usa `p-0` (sem padding) para permitir que o header e footer ocupem toda a largura
- O padding deve ser aplicado **apenas** na div de conteúdo interna
- `p-4` para mobile (16px) e `p-6` para desktop (24px) segue o padrão do projeto
- Isso garante consistência visual em todas as dialogs do sistema

**Arquivos corrigidos em 15/02/2026:**
- `NovaContagemDialog`, `EditarNomeContagemDialog`, `PDFExportEstoqueDialog` (moda/estoque)
- `AddProdutoDialog`, `AddFolgaDialog`, `RegistroVendaDialog` (moveis/)
- `UploadCartazDialog`, `CreateFolderDialog`, `CartazEditDialog`, `CartazDeleteDialog` (moveis/cartazes)
- `CardEditDialog`, `CardViewDialog`, `CardDeleteDialog` (promotional-cards/card/)
- `CardViewDialog`, `CardDeleteDialog`, `EditFolderDialog`, `CardEditDialog`, `CreateFolderDialog`, `DeleteFolderDialog` (promotional-cards/)
- `UploadCurriculoDialog`, `DeleteCurriculoDialog` (curriculos/)
- `AddFolgaDialog` (shared/folgas/)
- `RegistrarVendaDialog`, `ConfirmDeleteDialog` (moda/produto-foco/)
- `AddReservaDialog`, `EditReservaDialog` (moda/reservas/)
- `FileDialog`, `DeleteFileDialog`, `CategoryDialog` (crediario/diretorio/)
- `DeleteChatbotDialog` (assistentes-ai/)
- `CalculadoraIgreen` (pages/)
- `UploadCardDialog` (promotional-cards/)
- `ImagePreviewDialog` (crediario/folgas/, crediario/depositos/)
- `ProdutoFocoDetails` (moda/produto-foco/, moveis/produto-foco/)
- `DepositFormDialog` (crediario/depositos/)
- `EditarProdutoDialog` (moda/estoque/)
- `ProdutoFoco` (moveis/, moda/)
- `AdminProcedimentosButton` (ssc/)
- `Reservas` (moda/)
- `FileViewer` (crediario/diretorio/)
- `CartazViewDialog` (moveis/cartazes/)
- `CurriculoViewDialog` (curriculos/)

### Key Features

- **Responsive**: Automatically adjusts padding and layout for mobile/desktop
- **Scroll Fix**: Use `max-h-[85vh] overflow-y-auto` no DialogContent para rolagem funcionar
- **Content Scroll**: Use `<div className="flex-1 overflow-y-auto">` para conteúdo rolável interno
- **Gradient Header**: `bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5`
- **Icon Colors**: Support for primary, red (delete), amber (warning), blue (info), green (success)
- **Mobile-First**: Uses `useIsMobile()` hook for conditional styling
- **Accessibility**: Proper focus management and keyboard navigation

### Migration Guide

When updating existing dialogs:

1. Replace custom header markup with `<StandardDialogHeader />`
2. **Replace `StandardDialogContent` with `<div className="flex-1 overflow-y-auto">`**
3. Replace custom footer with `<StandardDialogFooter />`
4. Add `hideCloseButton` to `DialogContent`
5. **IMPORTANTE**: Ensure `DialogContent` tem `max-h-[85vh] overflow-y-auto flex flex-col`
6. Remove padding classes from `DialogContent` (handled by standard components)

Reference implementations:
- `src/components/moveis/produto-foco/ProdutoFoco.tsx`
- `src/components/assistentes-ai/dialogs/CreateChatbotDialog.tsx`
- `src/components/assistentes-ai/dialogs/EditChatbotDialog.tsx`
- `src/components/assistentes-ai/dialogs/DeleteChatbotDialog.tsx`

## Code Modularization Standards

### Fast Refresh Compliance

To ensure React Fast Refresh works correctly and avoid ESLint warnings (`react-refresh/only-export-components`), follow these modularization patterns:

#### Pattern 1: Separate Hooks from Components

**❌ INCORRECT** - Mixing hooks and components in the same file:
```tsx
// LoadingStates.tsx
export function LoadingSpinner() { ... }
export function useOnlineStatus() { ... }  // Hook mixed with component
```

**✅ CORRECT** - Separate files:
```
components/crediario/depositos/
├── LoadingStates.tsx          # Only exports components
├── hooks/
│   └── useOnlineStatus.ts     # Only exports hooks
```

#### Pattern 2: Context Modularization

**Structure for Contexts:**
```
src/contexts/Auth/
├── index.ts          # Public API exports
├── types.ts          # TypeScript interfaces
├── AuthContext.tsx   # Context creation
├── AuthProvider.tsx  # Provider component
└── useAuth.ts        # Hook for consumers
```

**Example Implementation:**

`src/contexts/Auth/types.ts`:
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}
```

`src/contexts/Auth/AuthContext.tsx`:
```typescript
import { createContext } from 'react';
import { AuthContextType } from './types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

`src/contexts/Auth/AuthProvider.tsx`:
```typescript
import { useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { User } from './types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const signIn = useCallback(async (email: string, password: string) => {
    // Implementation
  }, []);
  
  const signOut = useCallback(() => {
    setUser(null);
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, isLoading: false, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

`src/contexts/Auth/useAuth.ts`:
```typescript
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

`src/contexts/Auth/index.ts`:
```typescript
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export type { User, AuthContextType } from './types';
```

#### Pattern 3: UI Component Modularization

For shadcn/ui components that export both components and utilities:

**Structure:**
```
src/components/ui/button/
├── index.ts           # Public exports
├── Button.tsx         # Component only
├── buttonVariants.ts  # Utility function
└── types.ts           # Shared types
```

**Example:**

`src/components/ui/button/types.ts`:
```typescript
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './buttonVariants';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

`src/components/ui/button/buttonVariants.ts`:
```typescript
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap ...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        // ... more variants
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

`src/components/ui/button/Button.tsx`:
```typescript
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { buttonVariants } from './buttonVariants';
import { ButtonProps } from './types';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
```

`src/components/ui/button/index.ts`:
```typescript
export { Button } from './Button';
export { buttonVariants } from './buttonVariants';
export type { ButtonProps } from './types';
```

### Migration Checklist

When modularizing a file:

- [ ] Create new directory structure following patterns above
- [ ] Move types to `types.ts`
- [ ] Move hooks to `hooks/` subdirectory or separate file
- [ ] Move utility functions to separate file
- [ ] Keep only component exports in main file
- [ ] Update all imports across the codebase
- [ ] Run `npm run lint` to verify Fast Refresh compliance
- [ ] Run `npm run build` to ensure no broken imports
- [ ] Test the application manually

### Import Path Updates

When moving files, update imports using path aliases:

**Before:**
```typescript
import { useAuth } from '@/contexts/auth';
```

**After (modularized):**
```typescript
import { useAuth } from '@/contexts/Auth';  // Now uses index.ts
```

### Benefits of Modularization

1. **Fast Refresh**: Hot reload works correctly during development
2. **Tree Shaking**: Smaller bundle sizes in production
3. **Maintainability**: Clear separation of concerns
4. **Testability**: Easier to test isolated units
5. **Code Splitting**: Better opportunities for lazy loading

## Glassmorphism System

This project uses a custom glassmorphism design system defined in `src/styles/glassmorphism.css`.

### CSS Classes

#### Base Classes (translucent effect)
- `.glass-card` - 15% opacity (light mode), 25% (dark mode)
- `.glass-card-medium` - 10% opacity (light mode), 20% (dark mode)  
- `.glass-card-strong` - 5% opacity (light mode), 15% (dark mode)

Used for: Cards, ToolCards, Calculators, Product lists, Auth pages

#### Overlay Classes (opaque - for dropdowns/popovers/dialogs)
- `.glass-overlay` - 95% opacity (light mode), 98% (dark mode)
- `.glass-overlay-medium` - 90% opacity
- `.glass-overlay-strong` - 85% opacity (light mode), 92% (dark mode)

Used for: Dropdown menus, Popovers, Dialogs, Alert dialogs, Toasts

### Components Using Glassmorphism

**Using glass-overlay (opaque):**
- DropdownMenu (dropdown-menu.tsx)
- Popover (popover.tsx)
- Dialog (dialog.tsx)
- AlertDialog (alert-dialog.tsx)
- Toaster (sonner/Toaster.tsx)

**Using glass-card (translucent):**
- ToolCard, LinkCard (painel-regiao/)
- CalculadoraIgreen cards
- ProdutosList containers
- Auth page containers
- ProcedimentosSSC cards

### When to Use Each

**Use glass-overlay classes for:**
- Floating UI elements that need to be highly readable
- Elements that appear over other content
- Dropdowns, popovers, tooltips, toasts

**Use glass-card classes for:**
- Background cards and containers
- Elements that are part of the main layout
- Decorative glass effects
