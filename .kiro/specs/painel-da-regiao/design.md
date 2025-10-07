# Design Document - Painel da Região

## Overview

O Painel da Região é uma página pública que serve como hub centralizado de acesso rápido para a região de vendas "Litoral". A página apresenta duas seções principais: **Acesso Rápido** (links externos) e **Ferramentas da Região** (ferramentas internas). O design segue rigorosamente o sistema de design estabelecido no aplicativo, com foco em responsividade mobile-first, glassmorphism e experiência de usuário consistente.

## Architecture

### Component Hierarchy

```
PainelDaRegiao (Page)
├── PageLayout
│   ├── PageHeader
│   │   ├── Icon (MapPin ou Building2)
│   │   ├── Title: "Painel da Região"
│   │   └── Description: "Região Litoral - Acesso rápido a ferramentas e recursos"
│   │
│   ├── QuickAccessSection
│   │   ├── SectionTitle
│   │   └── Grid de LinkCards (externos)
│   │       ├── LinkCard (Resolve Lebes)
│   │       ├── LinkCard (Planilha de Indicadores)
│   │       └── LinkCard (Reunião da Região)
│   │
│   └── ToolsSection
│       ├── SectionTitle
│       └── Grid de ToolCards (internos)
│           └── ToolCard (Calculadora iGreen)
```

### Routing Structure

- **Rota**: `/painel-da-regiao`
- **Tipo**: Pública (sem autenticação)
- **Layout**: Standalone (sem AppLayout, similar à Calculadora iGreen)
- **Navegação**: Botão de voltar para o hub principal

## Components and Interfaces

### 1. PainelDaRegiao (Main Page Component)

```typescript
// src/pages/PainelDaRegiao.tsx

interface ExternalLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  iconColor?: string;
}

interface InternalTool {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string; // Ex: "Novo", "Beta"
}

const PainelDaRegiao: React.FC = () => {
  // Configuração de links externos
  const externalLinks: ExternalLink[] = [
    {
      id: 'resolve-lebes',
      title: 'Resolve Lebes',
      description: 'Sistema de resolução de problemas',
      url: 'https://resolve.applebes.com.br',
      icon: Headset,
      iconColor: 'text-blue-600'
    },
    {
      id: 'planilha-indicadores',
      title: 'Planilha de Indicadores',
      description: 'Indicadores de performance da região',
      url: 'https://lojalebes-my.sharepoint.com/...',
      icon: BarChart3,
      iconColor: 'text-green-600'
    },
    {
      id: 'reuniao-regiao',
      title: 'Reunião da Região',
      description: 'Acesso rápido à reunião no Teams',
      url: 'https://teams.microsoft.com/...',
      icon: Video,
      iconColor: 'text-purple-600'
    }
  ];

  // Configuração de ferramentas internas
  const internalTools: InternalTool[] = [
    {
      id: 'calculadora-igreen',
      title: 'Calculadora iGreen',
      description: 'Calcule elegibilidade para desconto na energia',
      route: '/calculadora-igreen',
      icon: Calculator,
      iconColor: 'text-primary',
      badge: 'Popular'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern (consistente com outras páginas) */}
      <BackgroundPattern />
      
      <PageLayout spacing="normal" maxWidth="xl">
        <PageHeader
          title="Painel da Região"
          description="Região Litoral - Acesso rápido a ferramentas e recursos"
          icon={MapPin}
          iconColor="text-primary"
        />

        {/* Seção de Acesso Rápido */}
        <QuickAccessSection links={externalLinks} />

        {/* Seção de Ferramentas */}
        <ToolsSection tools={internalTools} />
      </PageLayout>
    </div>
  );
};
```

### 2. QuickAccessSection Component

```typescript
// src/components/painel-regiao/QuickAccessSection.tsx

interface QuickAccessSectionProps {
  links: ExternalLink[];
}

const QuickAccessSection: React.FC<QuickAccessSectionProps> = ({ links }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ExternalLink className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Acesso Rápido
        </h2>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </section>
  );
};
```

### 3. ToolsSection Component

```typescript
// src/components/painel-regiao/ToolsSection.tsx

interface ToolsSectionProps {
  tools: InternalTool[];
}

const ToolsSection: React.FC<ToolsSectionProps> = ({ tools }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Ferramentas da Região
        </h2>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
};
```

### 4. LinkCard Component (Links Externos)

```typescript
// src/components/painel-regiao/LinkCard.tsx

interface LinkCardProps {
  link: ExternalLink;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  const handleClick = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className="glass-card cursor-pointer transition-all hover:scale-105 hover:shadow-lg group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          {/* Ícone e Badge de Link Externo */}
          <div className="flex items-start justify-between">
            <div className={cn(
              "p-2.5 rounded-lg bg-primary/10 border border-primary/20",
              link.iconColor
            )}>
              <link.icon className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Externo
            </Badge>
          </div>

          {/* Conteúdo */}
          <div className="space-y-1">
            <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
              {link.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {link.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 5. ToolCard Component (Ferramentas Internas)

```typescript
// src/components/painel-regiao/ToolCard.tsx

interface ToolCardProps {
  tool: InternalTool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(tool.route);
  };

  return (
    <Card
      className="glass-card cursor-pointer transition-all hover:scale-105 hover:shadow-lg group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          {/* Ícone e Badge (se houver) */}
          <div className="flex items-start justify-between">
            <div className={cn(
              "p-2.5 rounded-lg bg-primary/10 border border-primary/20",
              tool.iconColor
            )}>
              <tool.icon className="h-5 w-5" />
            </div>
            {tool.badge && (
              <Badge className="text-xs bg-primary">
                {tool.badge}
              </Badge>
            )}
          </div>

          {/* Conteúdo */}
          <div className="space-y-1">
            <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
              {tool.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {tool.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 6. BackgroundPattern Component

```typescript
// src/components/painel-regiao/BackgroundPattern.tsx

const BackgroundPattern: React.FC = () => {
  return (
    <div className="fixed inset-0 opacity-30 pointer-events-none dark:opacity-20">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse delay-2000" />
    </div>
  );
};
```

## Data Models

### TypeScript Interfaces

```typescript
// src/types/painel-regiao.ts

export interface ExternalLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  iconColor?: string;
}

export interface InternalTool {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
}

export interface PainelConfig {
  externalLinks: ExternalLink[];
  internalTools: InternalTool[];
}
```

### Configuration File (Escalabilidade)

```typescript
// src/config/painel-regiao.config.ts

import { 
  Headset, 
  BarChart3, 
  Video, 
  Calculator,
  // Futuros ícones para novas ferramentas
} from "lucide-react";
import { PainelConfig } from "@/types/painel-regiao";

export const painelConfig: PainelConfig = {
  externalLinks: [
    {
      id: 'resolve-lebes',
      title: 'Resolve Lebes',
      description: 'Sistema de resolução de problemas',
      url: 'https://resolve.applebes.com.br',
      icon: Headset,
      iconColor: 'text-blue-600'
    },
    {
      id: 'planilha-indicadores',
      title: 'Planilha de Indicadores',
      description: 'Indicadores de performance da região',
      url: 'https://lojalebes-my.sharepoint.com/:x:/g/personal/ivane_severo_lebes_com_br/ER76e97GRspEkX2-48uxQ8MBiKhViLxokfIp62U0ETBEyQ?rtime=AyASzikF3kg',
      icon: BarChart3,
      iconColor: 'text-green-600'
    },
    {
      id: 'reuniao-regiao',
      title: 'Reunião da Região',
      description: 'Acesso rápido à reunião no Teams',
      url: 'https://teams.microsoft.com/l/meetup-join/19:meeting_YWI4NGY1ODgtNzc4NS00NmEyLWJmYWYtYjVhNjVjMzM2ZDAx@thread.v2/0?context=%7B%22Tid%22:%22ff11934e-6ffd-4c02-a9fe-212344e18575%22,%22Oid%22:%22a51e462d-4645-42dd-b918-3e1da85d8660%22%7D',
      icon: Video,
      iconColor: 'text-purple-600'
    }
  ],
  internalTools: [
    {
      id: 'calculadora-igreen',
      title: 'Calculadora iGreen',
      description: 'Calcule elegibilidade para desconto na energia',
      route: '/calculadora-igreen',
      icon: Calculator,
      iconColor: 'text-primary',
      badge: 'Popular'
    }
    // Espaço para 5-6 ferramentas adicionais futuras
  ]
};
```

## Design System Compliance

### Colors

- **Primary**: Verde padrão do sistema (`hsl(142, 70%, 40%)`)
- **Card Background**: Glass effect com `backdrop-filter: blur(10px)`
- **Icon Colors**: Variados por contexto (azul, verde, roxo) para diferenciação visual
- **Hover States**: `hover:scale-105` e `hover:shadow-lg`

### Typography

- **Page Title**: `text-lg sm:text-xl lg:text-2xl font-semibold`
- **Section Titles**: `text-lg sm:text-xl font-semibold`
- **Card Titles**: `text-sm sm:text-base font-semibold`
- **Descriptions**: `text-xs sm:text-sm text-muted-foreground`

### Spacing

- **Page Layout**: `spacing="normal"` (2.5/4 units)
- **Section Gap**: `space-y-4`
- **Grid Gap**: `gap-3 sm:gap-4`
- **Card Padding**: `p-4 sm:p-5`

### Responsive Breakpoints

- **Mobile** (`< 768px`): 2 cards por linha
- **Desktop** (`>= 1024px`): 3 cards por linha (máximo)
- **Touch Targets**: Mínimo 44px de altura

## Error Handling

### Link Validation

```typescript
const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Uso no componente
useEffect(() => {
  externalLinks.forEach(link => {
    if (!validateUrl(link.url)) {
      console.error(`Invalid URL for ${link.title}: ${link.url}`);
    }
  });
}, [externalLinks]);
```

### Navigation Error Handling

```typescript
const handleNavigationError = (route: string) => {
  try {
    navigate(route);
  } catch (error) {
    console.error(`Navigation error to ${route}:`, error);
    toast({
      title: "Erro de navegação",
      description: "Não foi possível acessar esta ferramenta.",
      variant: "destructive"
    });
  }
};
```

### External Link Security

```typescript
// Sempre usar rel="noopener noreferrer" para links externos
window.open(url, '_blank', 'noopener,noreferrer');
```

## Testing Strategy

### Unit Tests

```typescript
// LinkCard.test.tsx
describe('LinkCard', () => {
  it('should open external link in new tab', () => {
    const mockOpen = jest.spyOn(window, 'open').mockImplementation();
    render(<LinkCard link={mockLink} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockOpen).toHaveBeenCalledWith(
      mockLink.url,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should display external badge', () => {
    render(<LinkCard link={mockLink} />);
    expect(screen.getByText('Externo')).toBeInTheDocument();
  });
});

// ToolCard.test.tsx
describe('ToolCard', () => {
  it('should navigate to internal route', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    
    render(<ToolCard tool={mockTool} />);
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockNavigate).toHaveBeenCalledWith(mockTool.route);
  });
});
```

### Integration Tests

```typescript
describe('PainelDaRegiao Integration', () => {
  it('should render all sections correctly', () => {
    render(<PainelDaRegiao />);
    
    expect(screen.getByText('Acesso Rápido')).toBeInTheDocument();
    expect(screen.getByText('Ferramentas da Região')).toBeInTheDocument();
  });

  it('should render correct number of cards', () => {
    render(<PainelDaRegiao />);
    
    const externalCards = screen.getAllByText('Externo');
    expect(externalCards).toHaveLength(3);
  });
});
```

### Accessibility Tests

```typescript
describe('Accessibility', () => {
  it('should be keyboard navigable', () => {
    render(<PainelDaRegiao />);
    
    const cards = screen.getAllByRole('button');
    cards[0].focus();
    
    expect(document.activeElement).toBe(cards[0]);
  });

  it('should have proper ARIA labels', () => {
    render(<LinkCard link={mockLink} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  it('should render within performance budget', async () => {
    const startTime = performance.now();
    render(<PainelDaRegiao />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // 100ms budget
  });
});
```

## Accessibility Considerations

### Keyboard Navigation

- Todos os cards são focáveis via Tab
- Enter e Space ativam os cards
- Focus ring visível em todos os elementos interativos

### Screen Readers

```typescript
// Exemplo de labels descritivos
<Card
  role="button"
  aria-label={`Abrir ${link.title} em nova aba`}
  tabIndex={0}
>
```

### Color Contrast

- Texto sobre fundo: Mínimo 4.5:1 (WCAG AA)
- Ícones: Cores com contraste adequado
- Hover states: Mantém contraste adequado

### Semantic HTML

```typescript
<section aria-labelledby="quick-access-title">
  <h2 id="quick-access-title">Acesso Rápido</h2>
  {/* Cards */}
</section>
```

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load da página
const PainelDaRegiao = lazy(() => import("./pages/PainelDaRegiao"));
```

### Memoization

```typescript
const LinkCard = memo(({ link }: LinkCardProps) => {
  // Component implementation
});

const ToolCard = memo(({ tool }: ToolCardProps) => {
  // Component implementation
});
```

### Image Optimization

- Ícones: Usar Lucide React (SVG otimizado)
- Sem imagens pesadas na página inicial

## Future Extensibility

### Adding New External Links

```typescript
// Adicionar no painel-regiao.config.ts
{
  id: 'novo-link',
  title: 'Novo Sistema',
  description: 'Descrição do novo sistema',
  url: 'https://exemplo.com',
  icon: IconName,
  iconColor: 'text-color-class'
}
```

### Adding New Internal Tools

```typescript
// Adicionar no painel-regiao.config.ts
{
  id: 'nova-ferramenta',
  title: 'Nova Ferramenta',
  description: 'Descrição da ferramenta',
  route: '/rota-da-ferramenta',
  icon: IconName,
  iconColor: 'text-primary',
  badge: 'Novo' // Opcional
}
```

### Potential Future Features

1. **Categorização**: Agrupar links/ferramentas por categoria
2. **Busca**: Campo de busca para filtrar cards
3. **Favoritos**: Sistema de favoritos do usuário
4. **Analytics**: Rastreamento de cliques nos links
5. **Personalização**: Ordem customizável dos cards
6. **Notificações**: Badges de novidades ou atualizações

## Design Decisions and Rationales

### 1. Separação de Links Externos e Ferramentas Internas

**Decisão**: Criar duas seções distintas com badges diferenciados.

**Rationale**: 
- Clareza visual sobre o comportamento esperado (nova aba vs navegação interna)
- Facilita a compreensão do usuário sobre onde será direcionado
- Permite escalabilidade independente de cada seção

### 2. Grid Responsivo 2/3 Colunas

**Decisão**: 2 colunas em mobile, 3 em desktop (máximo).

**Rationale**:
- Mobile: 2 colunas mantém cards legíveis sem serem muito pequenos
- Desktop: 3 colunas evita cards muito largos e mantém densidade visual adequada
- Escalável para 5-6 ferramentas futuras sem quebrar o layout

### 3. Glassmorphism Consistente

**Decisão**: Usar glass-card em todos os elementos principais.

**Rationale**:
- Consistência com o design system do app
- Estética moderna e profissional
- Diferenciação visual sem poluição

### 4. Configuração Centralizada

**Decisão**: Arquivo de configuração separado para links e ferramentas.

**Rationale**:
- Facilita manutenção e adição de novos itens
- Separa dados de apresentação
- Permite futuras integrações com backend/CMS

### 5. Página Standalone (sem AppLayout)

**Decisão**: Não usar AppLayout com header fixo e navigation tabs.

**Rationale**:
- Consistência com Calculadora iGreen (também standalone)
- Foco total no conteúdo da página
- Evita confusão com navegação principal do app
- Permite design mais limpo e focado
