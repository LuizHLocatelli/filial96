

# Plano: Indicadores Visuais de Tools Ativadas no Chat

## Conceito

Mostrar badges/chips animados acima da resposta do assistente indicando quais ferramentas foram usadas (ex: "🔍 Buscando na web...", "📚 Consultando base de conhecimento", "📄 Analisando documento"). Os indicadores aparecem em tempo real durante o streaming e permanecem como badges discretos na mensagem final.

## Mudancas

### 1. Edge Function (`gemini-assistant-chat`)
Enviar eventos SSE de "tool activation" antes do conteudo:
```
data: {"tool":"web_search","status":"active"}
data: {"tool":"rag","status":"active"}  
data: {"tool":"document_analysis","status":"active"}
```
- Emitir `web_search` quando `webSearchEnabled` e tools googleSearch sao adicionados
- Emitir `rag` quando `retrieveRAGContext` retorna contexto nao-vazio
- Emitir `document_analysis` quando `documents.length > 0`

### 2. Hook (`useChatSession.ts`)
- Novo state `activeTools: string[]` para rastrear tools ativadas durante streaming
- Parsear eventos SSE com campo `tool` e acumular no state
- Resetar ao final da mensagem
- Incluir `activeTools` no retorno do hook

### 3. Componente novo: `ChatToolBadges.tsx`
Badges compactos com icone + texto + animacao sutil:
- `web_search` → Globe icon, "Busca na Web"
- `rag` → BookOpen icon, "Base de Conhecimento"  
- `document_analysis` → FileText icon, "Analisando Documento"
- `image_generation` → Image icon, "Gerando Imagem"

Duas variantes:
- **Ativa** (durante streaming): badge com animacao pulse, texto "Buscando na web..."
- **Concluida** (mensagem salva): badge estatico discreto

### 4. Chat UI (`AssistenteChat.tsx`)
- Renderizar `ChatToolBadges` acima do bubble de resposta do modelo durante streaming
- Para mensagens salvas: detectar tools usadas pelo conteudo (presenca de "Fontes:" = web_search, etc.) e mostrar badges estaticos

### 5. Persistencia (opcional mas recomendado)
- Salvar `tools_used text[]` no `ai_chat_messages` para nao depender de heuristica no conteudo
- Atualizar o insert da mensagem do modelo no hook para incluir as tools detectadas

## Fluxo Visual

```text
┌──────────────────────────────────┐
│  🤖 Bot                         │
│  ┌─────────────┐ ┌────────────┐ │
│  │ 🔍 Busca Web│ │ 📚 RAG     │ │  ← badges animados
│  └─────────────┘ └────────────┘ │
│  ┌──────────────────────────────┐│
│  │ Resposta do assistente...    ││
│  └──────────────────────────────┘│
└──────────────────────────────────┘
```

