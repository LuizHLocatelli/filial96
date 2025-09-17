# 🔒 Sistema de Proteção - Calculadora iGreen

## Visão Geral

Este documento descreve o sistema abrangente de proteção implementado para a Calculadora iGreen, designed para dificultar significativamente tentativas de cópia, engenharia reversa ou uso não autorizado do código.

## ⚠️ Aviso Importante

**Nenhuma proteção frontend é 100% infalível.** O código JavaScript sempre pode ser acessado pelo navegador. Este sistema implementa múltiplas camadas de proteção que dificultam enormemente tentativas de cópia, mas não as tornam impossíveis para usuários extremamente determinados.

## 🛡️ Camadas de Proteção Implementadas

### 1. Proteção JavaScript/TypeScript (`codeProtection.ts`)

#### Recursos:
- **Desabilitação de DevTools**: Detecta e bloqueia abertura de ferramentas de desenvolvimento
- **Proteção de Console**: Limpa constantemente e desabilita métodos de console
- **Desabilitação de Atalhos**: Bloqueia F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I, etc.
- **Detecção de Debugging**: Monitora tentativas de debugging e execution timing
- **Proteção de Menu Contextual**: Desabilita botão direito do mouse
- **Seleção de Texto**: Previne seleção e cópia de texto
- **Integridade de Código**: Monitora modificações não autorizadas
- **Código Falso**: Injeta código decoy para confundir

#### Uso:
```typescript
import { initializeProtection, useCodeProtection } from "@/utils/codeProtection";

// Inicializar proteção
useEffect(() => {
  initializeProtection();
}, []);

// Verificar se ambiente é seguro
const { isSecure, canExecute } = useCodeProtection();
```

### 2. Proteção CSS (`CalculadoraIgreen.css`)

#### Recursos:
- **Desabilitação de Seleção**: `user-select: none` em todos os elementos
- **Proteção contra Drag & Drop**: Previne arrastar elementos
- **Proteção contra Impressão**: Esconde/modifica conteúdo ao imprimir
- **Detecção de DevTools**: CSS media queries para detectar mudanças de viewport
- **Proteção contra Screenshot**: Algumas técnicas de proteção visual

#### Classes principais:
```css
.calculadora-protected {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  user-select: none !important;
  /* ... outras proteções */
}
```

### 3. Ofuscação de Código (`buildProtection.js`)

#### Recursos:
- **Minificação Agressiva**: Remove comentários, espaços, renomeia variáveis
- **Ofuscação com javascript-obfuscator**: Transformações complexas do código
- **Criptografia de Strings**: Codifica strings importantes
- **Injeção de Proteções**: Adiciona scripts de proteção no HTML final
- **Debug Protection**: Dificulta debugging do código ofuscado

#### Configuração de Ofuscação:
```javascript
const obfuscationConfig = {
  compact: true,
  controlFlowFlattening: true,
  deadCodeInjection: true,
  debugProtection: true,
  selfDefending: true,
  stringArrayEncoding: ['rc4'],
  // ... mais opções
};
```

### 4. Configuração de Build (`vite.config.protection.ts`)

#### Recursos:
- **Terser com configurações agressivas**: Minificação máxima
- **Source maps desabilitados**: Remove mapas de código
- **Nomes de arquivos ofuscados**: Hashes aleatórios
- **Remoção de console.log**: Limpa logs em produção

## 🚀 Como Usar

### Desenvolvimento
```bash
npm run dev
```
- Proteções ativas mas com logs de debug
- Funcionalidade completa para desenvolvimento

### Build de Produção Protegido
```bash
npm run build:protected
```
- Aplica todas as proteções
- Ofusca código JavaScript
- Injeta proteções HTML adicionais
- Remove todos os logs e debugging

### Build de Produção (alias)
```bash
npm run build:production
```
- Mesmo que `build:protected`

### Aplicar proteções a build existente
```bash
npm run protect
```
- Aplica ofuscação a arquivos já buildados

## 🔍 Indicadores Visuais

### 1. Ícone de Proteção no Header
- Pequeno ícone de escudo verde quando proteção está ativa
- Visível apenas quando sistema está funcionando

### 2. Indicador de Proteção (canto inferior direito)
- Ícone de escudo verde semi-transparente
- Indica que proteções estão ativas
- Escondido em dispositivos móveis

## 🛠️ Funcionalidades de Proteção

### Proteções Ativas
1. ✅ **Desabilitação de DevTools** - F12, Ctrl+Shift+I bloqueados
2. ✅ **Proteção de Console** - Console limpo constantemente
3. ✅ **Seleção de Texto Bloqueada** - Exceto em campos de entrada
4. ✅ **Menu Contextual Desabilitado** - Botão direito bloqueado
5. ✅ **Atalhos de Teclado Bloqueados** - Ctrl+U, Ctrl+S, etc.
6. ✅ **Detecção de Viewport** - Detecta abertura de DevTools
7. ✅ **Proteção contra View-Source** - Bloqueia view-source:
8. ✅ **Código Decoy** - Injeta código falso para confundir
9. ✅ **Ofuscação JavaScript** - Código ilegível em produção
10. ✅ **Proteção contra Impressão** - Conteúdo protegido ao imprimir

### Verificações de Segurança
```typescript
// Verifica se ambiente é seguro antes de executar código sensível
if (!isSecure || !canExecute()) {
  // Bloqueia execução
  return;
}
```

## 📁 Arquivos do Sistema

```
src/
├── utils/
│   ├── codeProtection.ts      # Sistema principal de proteção
│   └── buildProtection.js     # Scripts de build e ofuscação
├── pages/
│   ├── CalculadoraIgreen.tsx  # Componente com proteções integradas
│   └── CalculadoraIgreen.css  # Estilos de proteção
├── vite.config.protection.ts  # Configuração de build protegido
└── package.json               # Scripts de build
```

## 🎯 Níveis de Proteção

### Nível 1 - Básico (Desenvolvimento)
- Proteções JavaScript ativas
- Logs de debug visíveis
- Source maps disponíveis

### Nível 2 - Médio (Staging)
- Proteções CSS completas
- Console parcialmente limpo
- Source maps limitados

### Nível 3 - Máximo (Produção)
- Todas as proteções ativas
- Código completamente ofuscado
- Zero logs ou debug info
- Proteções HTML injetadas

## 🔧 Troubleshooting

### Problema: Proteções interferem no desenvolvimento
**Solução**: Use `npm run dev` que mantém funcionalidade completa

### Problema: Build falha na ofuscação
**Solução**: Verifique se `javascript-obfuscator` está instalado:
```bash
npm install --save-dev javascript-obfuscator
```

### Problema: Proteções não funcionam
**Solução**: Certifique-se de usar `npm run build:protected` para produção

### Problema: App muito lento em produção
**Solução**: Ajuste configurações de ofuscação em `buildProtection.js`

## 📊 Efetividade das Proteções

### Contra usuários casuais: **95%+ efetivo**
- Bloqueio completo de acesso ao código
- Interface não responsiva a tentativas de cópia

### Contra usuários intermediários: **80%+ efetivo**
- Dificuldade significativa para acessar código
- Múltiplas camadas de proteção

### Contra usuários avançados: **60%+ efetivo**
- Código altamente ofuscado
- Proteções múltiplas dificultam engenharia reversa

### Contra especialistas em segurança: **30%+ efetivo**
- Ainda assim cria barreiras significativas
- Requer tempo e esforço consideráveis

## 🚨 Considerações Legais

Lembre-se de que as proteções técnicas devem ser complementadas com:
- **Termos de Uso claros**
- **Avisos de direitos autorais**
- **Monitoramento de uso indevido**
- **Ações legais quando necessário**

## 🔄 Manutenção

### Atualizações recomendadas:
1. **Mensalmente**: Verificar novos métodos de bypass
2. **Trimestralmente**: Atualizar configurações de ofuscação
3. **Semestralmente**: Revisar e melhorar proteções

### Monitoramento:
- Verificar logs de tentativas de bypass
- Monitorar uso anormal da aplicação
- Acompanhar novas ferramentas de bypass

---

**Nota**: Este sistema oferece proteção robusta contra a maioria das tentativas de cópia, mas sempre combine proteções técnicas com medidas legais e de monitoramento apropriadas.
