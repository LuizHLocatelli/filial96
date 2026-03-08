

# Plano: Ferramentas de Uso para Assistentes de IA

## Resumo

Adicionar 4 ferramentas ao módulo de Assistentes: Base de Conhecimento (RAG), Busca na Web, Analise de Documentos/PDF no chat, e Exportar Conversa. O projeto ja possui pgvector instalado, `gemini-document-analyzer` como referencia, e `jspdf` para exportacao.

---

## 1. Base de Conhecimento (RAG)

**Objetivo:** Permitir que cada assistente tenha documentos associados que sao consultados automaticamente ao responder.

**Database:**
- Nova tabela `ai_assistant_documents` com colunas: `id`, `assistant_id` (FK), `user_id`, `file_name`, `file_url`, `content_text` (texto extraido), `embedding` (vector(768)), `created_at`
- RLS: usuarios autenticados podem gerenciar documentos dos seus assistentes

**Edge Function:** Nova `gemini-embed-document`
- Recebe arquivo (PDF/texto), extrai conteudo via Gemini (como o `gemini-document-analyzer` ja faz), gera embedding via Gemini Embedding API (`text-embedding-004`), salva na tabela
- Na funcao `gemini-assistant-chat`, antes de responder: busca documentos relevantes via `cosine_distance` na tabela de embeddings do assistente, injeta como contexto no system message

**UI:**
- Aba "Documentos" no `AssistenteDialog` para upload/listagem de arquivos da base de conhecimento
- Indicador visual no chat quando a resposta usou documentos da base

---

## 2. Busca na Web (Google Search via Gemini)

**Objetivo:** Dar ao assistente capacidade de pesquisar na internet.

**Abordagem:** Usar o Gemini com Google Search grounding (built-in na API do Gemini) -- nao requer API key adicional.

**Edge Function:** Atualizar `gemini-assistant-chat`
- Adicionar instrucao no system message para detectar quando o usuario quer busca web
- Quando detectado, fazer chamada ao Gemini com `tools: [{ googleSearch: {} }]` (Google Search grounding nativo)
- Retornar resposta com citacoes/fontes inline

**UI:**
- Toggle "Busca Web" no `AssistenteDialog` (campo `web_search_enabled` na tabela `ai_assistants`)
- No chat, mostrar fontes/links quando a resposta incluir citacoes do Google Search

---

## 3. Analise de Documentos/PDF no Chat

**Objetivo:** Permitir enviar PDFs diretamente no chat para analise.

**Abordagem:** Reaproveitar logica do `gemini-document-analyzer` dentro do `gemini-assistant-chat`.

**Edge Function:** Atualizar `gemini-assistant-chat`
- Aceitar novo campo `documents` (array de `{ base64, mimeType, fileName }`) alem de `images`
- Quando documentos estiverem presentes, adiciona-los como `inlineData` nos parts da mensagem (Gemini ja suporta PDF inline)

**UI:**
- Atualizar `ChatInput` para aceitar arquivos PDF/TXT alem de imagens (expandir o `accept` do file input)
- Mostrar preview de documentos anexados com icone de arquivo (diferente do preview de imagem)
- Salvar URLs dos documentos em `ai_chat_messages` (reutilizar `image_urls` ou adicionar campo `document_urls`)

---

## 4. Exportar Conversa (PDF/TXT)

**Objetivo:** Botao para exportar historico da conversa.

**Abordagem:** Usar `jspdf` (ja instalado) no client-side.

**UI:**
- Botao "Exportar" no header do chat (`AssistenteChat.tsx`)
- Dropdown com opcoes: PDF ou TXT
- PDF: gerar com jspdf-autotable formatado com nome do assistente, titulo da sessao, mensagens com timestamps
- TXT: download simples com formatacao texto plano

---

## Ordem de Implementacao

1. **Exportar Conversa** (mais simples, client-side apenas)
2. **Analise de Documentos no Chat** (extensao do que ja existe)
3. **Busca na Web** (migration + edge function update)
4. **Base de Conhecimento RAG** (mais complexo: migration, nova edge function, embeddings, UI de upload)

## Detalhes Tecnicos

- O projeto usa `GEMINI_API_KEY` diretamente (nao Lovable AI) -- manter esse padrao
- pgvector ja esta instalado no Supabase (funcao `match_documents` existe)
- Bucket `ai-chat-attachments` ja existe para storage
- Tabela `ai_assistants` precisa de novos campos: `web_search_enabled` (boolean)
- Tabela `ai_chat_messages` precisa de campo `document_urls` (text[]) ou reutilizar `image_urls` renomeando para `attachment_urls`

