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
npm run analyze      # Bundle analysis (opens bundle-analysis.html)
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

### Testing
- Use Vitest with Testing Library (React Testing Library + jest-dom)
- Test files: `*.test.ts` or `*.test.tsx` in same directory as source
- Mock Supabase client and auth context in tests
- Structure tests with `describe` blocks for type/file and `it` for specific assertions

### Supabase Edge Functions
- Located in `supabase/functions/` with Deno runtime
- Configure with `deno.json` and `import_map.json`
- Deploy using `supabase_deploy_edge_function` MCP tool

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
