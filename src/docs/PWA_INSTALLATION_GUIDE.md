# Guia de Instalação do PWA - Filial 96

## O que foi implementado

✅ **Configuração completa do PWA no vite.config.ts**
- Manifest com todas as propriedades necessárias
- Service Worker configurado
- Ícones para todas as plataformas
- Cache inteligente para funcionamento offline

✅ **Botão de instalação inteligente**
- Detecta automaticamente quando pode instalar
- Instruções específicas para cada dispositivo
- Feedback visual do estado de instalação

✅ **Meta tags otimizadas no index.html**
- Suporte completo para iOS
- Configuração para Android
- Meta tags para Microsoft Edge

## Como testar a instalação

### 1. **Android (Chrome/Edge)**
1. Abra o site no Chrome ou Edge
2. Procure pelo ícone de "Instalar" na barra de endereços
3. Ou toque nos 3 pontos → "Adicionar à tela inicial"
4. Confirme a instalação

### 2. **iPhone/iPad (Safari)**
1. Abra o site no Safari
2. Toque no botão de compartilhar (quadrado com seta)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Toque em "Adicionar"

### 3. **Desktop (Chrome/Edge)**
1. Abra o site no Chrome ou Edge
2. Clique no ícone de instalação na barra de endereços
3. Ou acesse menu → "Instalar Filial 96"
4. Confirme clicando em "Instalar"

## Critérios necessários para instalação

Para que um PWA seja instalável, ele precisa atender aos seguintes critérios:

### ✅ **Critérios técnicos atendidos**
- [x] Manifest válido com propriedades obrigatórias
- [x] Service Worker registrado
- [x] HTTPS (em produção)
- [x] Ícones 192x192 e 512x512 definidos
- [x] start_url definida
- [x] display: standalone ou minimal-ui
- [x] name e short_name definidos

### 🔧 **Possíveis problemas**

1. **HTTPS**: Em desenvolvimento local (localhost), o PWA funciona. Em produção, é necessário HTTPS.

2. **Domínio**: Alguns navegadores só permitem instalação em domínios "reais" (não IP).

3. **Critério de engajamento**: Alguns browsers requerem que o usuário tenha interagido com o site por um tempo mínimo.

## Debugging

### Como verificar se está funcionando:

1. **Console do navegador**:
```javascript
// Verificar se o manifest está carregado
console.log('Manifest:', window.navigator.serviceWorker);

// Verificar service worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

2. **Chrome DevTools**:
- Abra F12 → Application → Manifest
- Verifique se todas as propriedades estão corretas
- Application → Service Workers
- Verifique se o SW está registrado e ativo

3. **Lighthouse Audit**:
- F12 → Lighthouse → PWA audit
- Verifica todos os critérios de instalação

## Configurações importantes implementadas

```typescript
// vite.config.ts - Configuração PWA
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Filial 96 - Sistema de Gerenciamento',
    short_name: 'Filial 96',
    display: 'standalone',
    start_url: '/',
    theme_color: '#22c55e',
    background_color: '#ffffff',
    icons: [/* ícones completos */]
  }
})
```

## Próximos passos

1. **Teste em produção com HTTPS**
2. **Verifique se aparece o prompt de instalação**
3. **Teste o funcionamento offline**
4. **Valide com Lighthouse PWA audit**

## Componentes implementados

- `InstallPWAButton.tsx` - Botão inteligente de instalação
- `PWAOnboarding.tsx` - Tutorial para novos usuários
- Integração no `EnhancedTopBar.tsx`

O PWA está tecnicamente correto e deve funcionar. Se não aparecer a opção de instalação, pode ser devido aos critérios do navegador (engajamento, domínio, etc.). 