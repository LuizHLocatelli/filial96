# Status Bar Transparente - PWA Filial 96

## Implementação Realizada

Foi implementado um sistema completo para tornar a status bar do PWA transparente e adaptável ao tema da aplicação, proporcionando um visual mais uniforme e moderno.

## Arquivos Modificados

### 1. `index.html`
- **theme-color**: Alterado de `#22c55e` para `transparent`
- **apple-mobile-web-app-status-bar-style**: Configurado como `black-translucent`
- **mobile-web-app-status-bar-style**: Configurado como `translucent`
- **viewport**: Adicionado `viewport-fit=cover` para suporte a safe areas
- **Removidas**: Meta tags duplicadas

### 2. `vite.config.ts`
- **theme_color** do manifesto PWA: Alterado para `transparent`

### 3. `src/hooks/useStatusBarTheme.ts` (NOVO)
Hook que monitora mudanças de tema e atualiza dinamicamente:
- Meta tag `theme-color` baseada no tema atual
- Status bar style para iOS
- Cores: `#ffffff` (modo claro) e `#0a0a0a` (modo escuro)

### 4. `src/styles/pwa-status-bar.css` (NOVO)
Estilos CSS para suporte completo ao PWA:
- Safe area insets para dispositivos com notch
- Padding adequado em modo standalone
- Transições suaves para mudanças de tema
- Suporte para orientação landscape

### 5. `src/App.tsx`
- Importação do hook `useStatusBarTheme`
- Importação dos estilos CSS
- Refatoração para usar o hook dentro do ThemeProvider

### 6. `src/components/layout/AppLayout.tsx`
- Adicionadas classes CSS: `app-container` e `status-bar-transition`
- Suporte para safe areas automático

## Comportamento

### iOS (Safari/PWA)
- Status bar completamente transparente
- Conteúdo se adapta às safe areas automaticamente
- Respeita notch e dynamic island

### Android (Chrome/PWA)
- Theme color se adapta ao tema da aplicação
- Status bar translúcida com cor de fundo adequada

### Mudanças de Tema
- Atualização automática da cor da status bar
- Transições suaves entre temas claro/escuro
- Sincronização com tema do sistema

## Cores Utilizadas

| Tema | Theme Color | Descrição |
|------|-------------|-----------|
| Claro | `#ffffff` | Branco puro |
| Escuro | `#0a0a0a` | Preto profundo |
| Transparente | `transparent` | Fallback inicial |

## Compatibilidade

- ✅ iOS 11.3+ (Safari PWA)
- ✅ Android 5.0+ (Chrome PWA)
- ✅ Desktop PWA (Edge, Chrome)
- ✅ Tema automático baseado no sistema
- ✅ Safe areas (iPhone X+, notch devices)

## Tecnologias Utilizadas

- **CSS env()**: Para safe area insets
- **@media (display-mode: standalone)**: Detecção de PWA
- **Meta tags dinâmicas**: Atualização via JavaScript
- **React Hooks**: Monitoramento de tema
- **CSS-in-JS**: Transições suaves

## Vantagens

1. **Visual Uniforme**: Status bar se integra ao design
2. **Modernidade**: Aparência nativa em dispositivos móveis
3. **Responsividade**: Adapta-se a diferentes formatos de tela
4. **Acessibilidade**: Mantém contraste adequado
5. **Performance**: Atualização eficiente sem re-renders desnecessários 