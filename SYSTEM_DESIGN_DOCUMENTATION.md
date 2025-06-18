# Sistema de Design - Filial 96 App

## 🎨 Visão Geral

Este documento define o sistema de design unificado do aplicativo Filial 96, estabelecendo padrões consistentes para garantir uma experiência de usuário coesa em todas as páginas e componentes.

## 🎨 Design Tokens

### Cores

#### Cores Primárias
- **Primary**: `hsl(142, 70%, 40%)` - Verde principal do sistema
- **Primary Foreground**: `hsl(150, 40%, 98%)` - Texto sobre fundo primário
- **Background**: `hsl(0, 0%, 97.3%)` (light) / `hsl(144, 71%, 4%)` (dark)
- **Foreground**: `hsl(142, 84%, 4.9%)` (light) / `hsl(153, 31%, 91%)` (dark)

#### Cores Semânticas
- **Destructive**: `hsl(0, 84.2%, 60.2%)` - Vermelho para ações destrutivas
- **Success**: Variações de verde para estados de sucesso
- **Warning**: Variações de amarelo para avisos
- **Muted**: `hsl(145, 16.3%, 46.9%)` (light) / `hsl(145, 16.3%, 56.9%)` (dark)

#### Cores de Interface
- **Border**: `hsl(144, 31.8%, 91.4%)` (light) / `hsl(156, 34%, 17%)` (dark)
- **Card**: `hsl(0, 0%, 100%)` (light) / `hsl(144, 71%, 4%)` (dark)
- **Input**: Mesma cor da border
- **Ring**: Mesma cor da primary para focus states

### Espaçamento

```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-2xl: 3rem;    /* 48px */
```

### Sombras

```css
--shadow-soft: 0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 16px -4px rgba(0, 0, 0, 0.06);
--shadow-medium: 0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 8px 24px -4px rgba(0, 0, 0, 0.08);
--shadow-strong: 0 8px 24px -4px rgba(0, 0, 0, 0.16), 0 16px 48px -8px rgba(0, 0, 0, 0.12);
```

### Raios de Borda

- **Radius padrão**: `0.5rem` (8px)
- **Cards**: `rounded-xl` (12px) em desktop, `rounded-2xl` (16px) em mobile
- **Botões**: `rounded-xl` (12px)
- **Inputs**: `rounded-lg` (8px)

## 🧩 Componentes Base

### 1. Layout System

#### AppLayout
- **Estrutura**: Header fixo + Main content + Navigation tabs
- **Responsividade**: Padding bottom ajustado para mobile
- **Animação**: Fade in suave no content principal

#### PageLayout
- **Variantes de espaçamento**: `tight`, `normal`, `relaxed`
- **Max-width**: Configurável de `sm` até `full`
- **Padding responsivo**: Ajustado automaticamente para mobile

#### PageHeader
- **Elementos**: Título, descrição, ícone, breadcrumbs
- **Variantes**: `default`, `minimal`, `feature`
- **Cores de ícone**: Configuráveis por contexto

### 2. Sistema de Cards

#### Card Principal
```typescript
<Card glassmorphism={true} variant="glass">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Variantes de Card
- **Default**: Card sólido com border
- **Glass**: Efeito glassmorphism (padrão)
- **Gradient**: Card com gradiente colorido

#### GlassCard
- **Variantes**: `light`, `medium`, `strong`
- **Gradientes**: `primary`, `secondary`, `accent`

### 3. Sistema de Botões

#### Variantes de Button
- **Default**: Botão principal com glass effect
- **Secondary**: Versão secundária
- **Outline**: Apenas borda
- **Ghost**: Transparente
- **Destructive**: Para ações perigosas
- **Success/Warning**: Estados semânticos

#### Tamanhos
- **sm**: `h-8` - Para interfaces compactas
- **default**: `h-10` - Padrão
- **lg**: `h-12` - Para CTAs importantes
- **icon**: `h-10 w-10` - Botões apenas com ícone

### 4. Sistema de Navegação

#### NavigationTabs
- **Glass effect**: Background semi-transparente
- **Indicador ativo**: Verde com shadow
- **Responsividade**: Layout adaptado para mobile

#### PageNavigation
- **Variantes**: `cards`, `tabs`
- **Configuração**: Array de tabs com ícones e componentes
- **Layout**: Grid responsivo

## 📱 Responsividade

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Padrões Mobile
- **Touch targets**: Mínimo 44px de altura
- **Espaçamento**: Reduzido em 25-30%
- **Typography**: Tamanhos menores
- **Cards**: Bordas mais arredondadas
- **Layout**: 2 cards por linha em vez de grid completo

## 🎭 Sistema Glassmorphism

### Classes Base
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Variantes
- **Light**: Transparência mínima
- **Medium**: Transparência moderada
- **Strong**: Transparência alta
- **Primary**: Com gradiente verde
- **Secondary**: Com gradiente secundário

## 🎨 Diretrizes de Uso

### ✅ Boas Práticas

1. **Consistência de Cores**
   - Usar sempre tons de verde harmonizados
   - Evitar muitas cores diferentes
   - Manter ícones em verde sempre que possível

2. **Layout e Espaçamento**
   - Usar PageLayout para todas as páginas
   - Implementar PageHeader consistentemente
   - Respeitar os espaçamentos definidos

3. **Cards e Containers**
   - Preferir GlassCard para elementos principais
   - Usar variantes apropriadas por contexto
   - Manter informações importantes sempre visíveis

4. **Mobile First**
   - Botões menores e espaçamento compacto
   - 2 cards por linha em layouts grid
   - Touch targets adequados

### ❌ Anti-padrões

1. **Cores**
   - Usar azul escuro em dark mode
   - Misturar muitas variações de verde
   - Esconder informações importantes em hover

2. **Layout**
   - Criar scroll horizontal
   - Usar botões muito grandes em mobile
   - Inconsistência entre páginas similares

3. **UX**
   - Lazy loading desnecessário
   - Fontes que parecem estranhas
   - Gradientes coloridos em backgrounds de subpáginas

## 📋 Checklist de Padronização

### Para Nova Página/Componente

- [ ] Usa PageLayout com configurações apropriadas
- [ ] Implementa PageHeader consistente
- [ ] Utiliza sistema de cores padrão
- [ ] Cards seguem padrão glassmorphism
- [ ] Botões usam variantes corretas
- [ ] Responsividade implementada
- [ ] Animações suaves incluídas
- [ ] Acessibilidade considerada

### Para Refatoração

- [ ] Remove inconsistências de cores
- [ ] Padroniza espaçamentos
- [ ] Unifica sistema de cards
- [ ] Ajusta responsividade mobile
- [ ] Remove anti-padrões identificados
- [ ] Testa em diferentes dispositivos

## 🛠️ Ferramentas e Utilitários

### Hooks Padrão
- `useIsMobile()`: Para responsividade
- `useResponsive()`: Para breakpoints específicos

### Classes Utilitárias
- `gradient-text`: Para títulos com gradiente
- `glass-*`: Para efeitos glassmorphism
- `animate-fade-in`: Para animações de entrada

### Componentes de Layout
- `PageLayout`: Container principal
- `PageHeader`: Cabeçalho padronizado
- `PageNavigation`: Sistema de tabs

## 🎯 Próximos Passos

1. **Auditoria Completa**: Identificar páginas não conformes
2. **Refatoração Gradual**: Padronizar página por página
3. **Testes**: Verificar consistência em todos os dispositivos
4. **Documentação de Componentes**: Expandir para casos específicos
5. **Guidelines de Contribuição**: Para novos desenvolvedores

---

**Versão**: 1.0  
**Última atualização**: $(date)  
**Responsável**: Equipe de Desenvolvimento Filial 96 