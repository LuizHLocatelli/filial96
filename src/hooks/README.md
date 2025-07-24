# Hooks Architecture

## Produto Foco System

The Produto Foco system has been refactored to follow a shared implementation pattern:

### Structure

- `useProdutoFoco.ts`: Main hook that provides a unified interface for both "moda" and "moveis" modules
- `useGenericProdutoFocoCRUD.ts`: Generic CRUD operations for Produto Foco items
- `useGenericProdutoFocoData.ts`: Data fetching and state management
- `useGenericProdutoFocoImages.ts`: Image upload and management
- `useGenericProdutoFocoSales.ts`: Sales registration and management

### Usage

To use the system in a component:

```tsx
// For Moda module
import { useProdutoFoco } from '@/components/moda/produto-foco/hooks/useProdutoFoco';

// For Moveis module
import { useProdutoFoco } from '@/components/moveis/produto-foco/hooks/useProdutoFoco';

// In your component
function MyComponent() {
  const { 
    produtos, 
    produtoAtivo, 
    isLoading,
    createProduto,
    updateProduto,
    deleteProduto,
    uploadImagem,
    deleteImagem,
    registrarVenda,
    getVendasPorProduto,
    refetch 
  } = useProdutoFoco();
  
  // Use the methods as needed
}
```

### Benefits

1. **DRY (Don't Repeat Yourself)**: Eliminates duplicate code across modules
2. **Maintainability**: Changes to core functionality only need to be made in one place
3. **Consistency**: Ensures consistent behavior across different modules
4. **Scalability**: Easy to extend to other modules if needed

### Implementation Notes

The generic hooks accept parameters to determine which database tables to use, allowing the same code to work with different data sources.