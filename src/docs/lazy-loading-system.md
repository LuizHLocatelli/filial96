# Sistema Avançado de Lazy Loading - Filial 96

## Visão Geral

Este documento descreve a implementação completa do sistema de Lazy Loading otimizado para o projeto Filial 96, projetado para melhorar significativamente a performance da aplicação através de carregamento inteligente de componentes e bibliotecas.

## Arquitetura do Sistema

### 1. Componentes Principais

#### `useLazyComponent.ts`
Hook principal para lazy loading com recursos avançados:
- **Cache de componentes** - Evita recarregamentos desnecessários
- **Sistema de retry** - Tenta novamente em caso de falha
- **Métricas de performance** - Coleta dados de carregamento
- **Estratégias de preload** - Suporte a diferentes abordagens

#### `LazyLoadingWrapper.tsx`
Wrapper genérico para envolver componentes lazy:
- Tipos específicos de loading (page, component, dialog)
- Fallbacks customizáveis
- Suporte a mobile

#### `useIntelligentPreload.ts`
Sistema inteligente de preload baseado em:
- **Padrões de navegação** - Aprende com o comportamento do usuário
- **Probabilidade de rotas** - Preload baseado em estatísticas
- **Tempo de sessão** - Preload progressivo
- **Tempo idle** - Aproveita momentos de inatividade

### 2. Funcionalidades Implementadas

#### Lazy Loading de Páginas
```tsx
// AppRoutes.tsx
const HubProdutividade = lazy(() => import("./pages/HubProdutividade"));
const Crediario = lazy(() => import("./pages/Crediario"));
const Moveis = lazy(() => import("./pages/Moveis"));
```

#### Lazy Loading de Bibliotecas Pesadas
```tsx
// PDF Viewer com lazy loading da biblioteca pdfjs-dist
const loadPDFLibrary = () => ExternalLibraryLoader.loadLibrary(
  'pdfjs-dist',
  () => import('pdfjs-dist')
);

// Charts com lazy loading do Recharts
const loadRechartsLibrary = () => ExternalLibraryLoader.loadLibrary(
  'recharts',
  () => import('recharts')
);
```

#### Lazy Loading de Dialogs
```tsx
import { LazyDialogWrapper, useLazyDialog } from '@/components/layout/LazyDialogWrapper';

// Uso básico
<LazyDialogWrapper
  trigger={<Button>Abrir Dialog</Button>}
  importFunction={() => import('./MeuDialog')}
  componentName="MeuDialog"
  preloadStrategy="hover"
/>

// Com hook
const { DialogComponent, openDialog } = useLazyDialog(
  () => import('./MeuDialog'),
  'MeuDialog'
);
```

### 3. Estratégias de Preload

#### Por Hover/Focus
```tsx
const { preloadOnHover } = usePreloadOnHover();

<Button {...preloadOnHover(() => import('./ComponentePesado'), 'ComponentePesado')}>
  Hover para preload
</Button>
```

#### Por Visibilidade
```tsx
const { preloadOnVisible } = usePreloadOnVisible();

const setRef = preloadOnVisible(
  () => import('./ComponentePesado'),
  'ComponentePesado',
  0.1 // threshold
);

<div ref={setRef}>Elemento que trigga preload quando visível</div>
```

#### Por Tempo Idle
```tsx
const { preloadOnIdle } = usePreloadOnIdle();

useEffect(() => {
  preloadOnIdle(
    () => import('./ComponentePesado'),
    'ComponentePesado',
    5000 // timeout
  );
}, []);
```

### 4. Sistema de Cache

#### Cache de Componentes
- Evita recarregamentos desnecessários
- Mantém componentes em memória após primeiro carregamento
- Estatísticas de cache disponíveis

#### Cache de Bibliotecas
- Bibliotecas externas são carregadas apenas uma vez
- Sistema singleton para bibliotecas pesadas
- Preload de bibliotecas durante tempo idle

### 5. Métricas e Analytics

#### Dashboard de Desenvolvimento
Disponível em ambiente de desenvolvimento:
- **Atalho**: `Ctrl + Shift + L`
- **Métricas em tempo real**: Tempos de carregamento, cache status
- **Performance score**: Baseado na velocidade média de carregamento
- **Componentes recentes**: Lista dos últimos componentes carregados

#### Analytics de Navegação
- Rastreamento de transições entre rotas
- Probabilidades dinâmicas de navegação
- Otimização automática de preload baseada no comportamento

### 6. Configurações e Otimizações

#### Padrões de Rota Configurados
```typescript
const ROUTE_PATTERNS: RoutePattern[] = [
  { from: '/', to: '/crediario', probability: 0.7, preloadDelay: 2000 },
  { from: '/', to: '/moveis', probability: 0.6, preloadDelay: 3000 },
  { from: '/crediario', to: '/depositos', probability: 0.8, preloadDelay: 1000 },
  // ...
];
```

#### Estratégias por Rota
```typescript
const PRELOAD_STRATEGIES: PreloadStrategy[] = [
  {
    route: '/',
    components: ['Crediario', 'Moveis', 'MetricsChart'],
    libraries: ['recharts'],
    priority: 'high'
  },
  // ...
];
```

### 7. Componentes Otimizados

#### PDF Viewer
- Lazy loading da biblioteca `pdfjs-dist` (biblioteca muito pesada)
- Configuração do worker sob demanda
- Estados de loading específicos para biblioteca e conteúdo

#### Charts
- Lazy loading do `recharts`
- Fallbacks com skeleton durante carregamento
- Error boundaries para falhas de carregamento

#### Dialogs
- Componentes de dialog carregados apenas quando necessário
- Preload estratégico baseado em hover
- Cache para evitar recarregamentos

### 8. Performance Targets

#### Tempos de Carregamento
- **Excelente**: < 200ms
- **Bom**: 200ms - 500ms
- **Aceitável**: 500ms - 1000ms
- **Lento**: > 1000ms

#### Estratégias de Retry
- 3 tentativas por padrão
- Backoff exponencial (1s, 2s, 3s)
- Logs detalhados para debugging

### 9. Monitoramento

#### Em Desenvolvimento
- Dashboard visual com métricas em tempo real
- Console logs detalhados
- Estatísticas de cache e preload

#### Em Produção
- Métricas coletadas via `lazyLoadingMetrics`
- Analytics de navegação para otimização
- Error tracking para componentes que falharam

### 10. Boas Práticas

#### Para Desenvolvedores
1. **Use lazy loading para componentes > 50KB**
2. **Implemente fallbacks apropriados**
3. **Configure preload para componentes críticos**
4. **Monitore métricas regularmente**
5. **Teste em diferentes condições de rede**

#### Componentes Recomendados para Lazy Loading
- Páginas principais
- Dialogs e modais
- Charts e gráficos
- PDF viewers
- Bibliotecas externas pesadas
- Componentes condicionais

### 11. Troubleshooting

#### Problemas Comuns
1. **Componente não carrega**: Verificar console para erros de import
2. **Loading muito longo**: Verificar tamanho do bundle e rede
3. **Cache não funciona**: Verificar se componentName está correto
4. **Preload não ativa**: Verificar estratégia e triggers

#### Debug
- Use `Ctrl + Shift + L` para abrir dashboard
- Execute `console.table(lazyLoadingMetrics.getMetrics())` para detalhes
- Verifique Network tab no DevTools

### 12. Futuras Melhorias

#### Roadmap
1. **Preload baseado em ML** - Usar machine learning para predição
2. **Service Worker integration** - Cache mais agressivo
3. **Bundle analysis integration** - Análise automática de tamanhos
4. **A/B testing de estratégias** - Testar diferentes abordagens
5. **Progressive loading** - Carregamento progressivo de partes de componentes

---

## Exemplos de Uso

### Lazy Loading Básico
```tsx
import { useLazyComponent } from '@/hooks/useLazyComponent';

const LazyChart = useLazyComponent(
  () => import('./HeavyChart'),
  'HeavyChart'
);

function MyPage() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <LazyChart data={data} />
    </Suspense>
  );
}
```

### Preload Inteligente
```tsx
import { useIntelligentPreload } from '@/hooks/useIntelligentPreload';

function App() {
  const { preloadComponent } = useIntelligentPreload();
  
  // Preload manual quando necessário
  const handleUserAction = () => {
    preloadComponent(
      () => import('./ExpensiveComponent'),
      'ExpensiveComponent'
    );
  };
}
```

### Dialog Lazy
```tsx
import { LazyDialogWrapper } from '@/components/layout/LazyDialogWrapper';

<LazyDialogWrapper
  trigger={<Button>Editar Item</Button>}
  importFunction={() => import('./EditItemDialog')}
  componentName="EditItemDialog"
  preloadStrategy="hover"
  dialogProps={{ itemId: item.id }}
/>
```

Este sistema de Lazy Loading foi projetado para ser **eficiente**, **inteligente** e **fácil de usar**, garantindo uma experiência de usuário superior com tempos de carregamento otimizados e consumo reduzido de recursos. 