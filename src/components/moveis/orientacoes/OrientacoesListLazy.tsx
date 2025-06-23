
import { lazy } from 'react';
import { LazyLoadingWrapper } from '@/components/layout/LazyLoadingWrapper';

// Lazy load do componente principal
const OrientacoesListComponent = lazy(() => 
  import('./OrientacoesList').then(module => ({ default: module.OrientacoesList }))
);

interface OrientacoesListLazyProps {
  onNovaOrientacao?: () => void;
}

export function OrientacoesListLazy(props: OrientacoesListLazyProps) {
  return (
    <LazyLoadingWrapper type="component">
      <OrientacoesListComponent {...props} />
    </LazyLoadingWrapper>
  );
}
