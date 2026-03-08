

# Melhorias de UX/UI para Telas Pequenas - Assistentes de IA

Identifiquei vários problemas de usabilidade em mobile ao analisar todos os componentes do módulo.

## Problemas Encontrados

1. **Botoes de acao ocultos por hover**: Os botoes de editar assistente, deletar conversa e remover anexo usam `group-hover:opacity-100` que nao funciona em telas touch -- ficam permanentemente invisíveis no mobile.

2. **Container principal muito restritivo**: `h-[calc(100vh-12rem)]` pode cortar conteudo em telas pequenas (< 640px). Nao considera a barra de endereco dinamica do mobile.

3. **Tela de boas-vindas com padding excessivo**: `p-8` na welcome screen comprime o conteudo desnecessariamente em telas pequenas.

4. **Imagens anexadas grandes demais**: `max-w-48 max-h-48` (192px) ocupa quase a tela inteira em dispositivos de 320px.

5. **Prose/Markdown overflow**: Blocos de codigo em `<pre>` dentro das mensagens podem estourar horizontalmente sem `overflow-x-auto`.

6. **Disclaimer do Gemini ocupa espaco valioso**: O texto "O Gemini pode cometer erros" sempre visivel consome espaco precioso no mobile.

7. **Dialog de criar assistente**: O campo "Gerar com IA" tem layout horizontal (`flex gap-2`) que fica apertado em telas < 400px.

## Mudancas Planejadas

### AssistentesSidebar.tsx
- Botao de editar assistente: adicionar `sm:opacity-0 sm:group-hover:opacity-100` (sempre visivel no mobile, hover no desktop)
- Botao de deletar conversa: mesma abordagem
- Adicionar safe area padding inferior para notched phones

### AssistentesHub.tsx
- Trocar `h-[calc(100vh-12rem)]` por `h-[calc(100dvh-12rem)]` usando `dvh` (dynamic viewport height) para respeitar barra de endereco mobile

### AssistenteChat.tsx
- Welcome screen: `p-4 sm:p-8` ao inves de `p-8`
- Titulo: `text-xl sm:text-2xl`
- Imagens nas mensagens: `max-w-32 sm:max-w-48 max-h-32 sm:max-h-48`
- Adicionar `prose-pre:overflow-x-auto` para code blocks nao estourarem

### ChatInput.tsx
- Disclaimer: esconder no mobile com `hidden sm:block`
- Botao de remover documento: sempre visivel no mobile (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`)

### AssistenteDialog.tsx
- Secao "Gerar com IA": usar `flex-col sm:flex-row` no container do input + botao
- Textarea de system_message: `min-h-[180px] sm:min-h-[250px]`

Sao ajustes cirurgicos focados em touch targets, espacamento e visibilidade -- sem redesign estrutural.

