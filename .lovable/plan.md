

## Diagnóstico do RAG - Upload de PDFs Grandes

### Problemas Identificados

**1. Problema Principal: PDF inteiro enviado como base64 no body da request**
O cliente lê o arquivo inteiro como base64 e envia no corpo JSON para a edge function. Um PDF de 40MB vira ~53MB em base64. Supabase Edge Functions têm limite de ~150MB de memória e ~2s CPU. Além disso, o payload JSON tem limites práticos de ~6MB para edge functions.

**2. Gemini API tem limite de ~20MB para inline data**
O `inlineData` do Gemini aceita no máximo ~20MB de dados base64. PDFs de 40MB excedem isso.

**3. Build errors: `error.message` em catch blocks**
Três edge functions usam `error.message` sem type assertion, causando `TS18046: 'error' is of type 'unknown'`.

### Plano de Correção

**A. Refatorar arquitetura: enviar URL em vez de base64**
Em vez de enviar o PDF inteiro como base64, o fluxo será:
1. Cliente faz upload do arquivo para Supabase Storage (já faz isso)
2. Cliente envia apenas a **URL pública** para a edge function (sem base64)
3. Edge function usa a **File API do Gemini** para upload de arquivos grandes, ou baixa o PDF via URL e processa em páginas

**B. Implementar upload via Gemini File API para arquivos grandes**
A Gemini File API suporta arquivos até 2GB. O fluxo:
1. Edge function baixa o PDF do Storage via URL
2. Faz upload para Gemini File API (`media/upload`)
3. Usa a referência do arquivo (`fileUri`) no `generateContent` para extração de texto
4. Gera embeddings dos chunks normalmente

**C. Fallback para arquivos pequenos**
Manter `inlineData` para arquivos < 10MB (mais rápido). Usar File API para > 10MB.

**D. Corrigir build errors**
Adicionar `(error as Error).message` nos 3 catch blocks das edge functions.

### Arquivos a Modificar

1. **`src/components/assistentes/hooks/useAssistantDocuments.ts`**
   - Remover leitura base64 do FileReader
   - Enviar apenas `fileUrl`, `fileName`, `mimeType`, `fileSize` para a edge function

2. **`supabase/functions/gemini-embed-document/index.ts`**
   - Adicionar função `uploadToGeminiFileAPI()` para arquivos grandes
   - Modificar `extractTextFromFile()` para aceitar URL ou fileUri
   - Para arquivos > 10MB: baixar do Storage → upload Gemini File API → extrair texto via fileUri
   - Para arquivos ≤ 10MB: baixar do Storage → converter para base64 → inlineData (atual)
   - Fix: `(error as Error).message`

3. **`supabase/functions/gemini-assistant-chat/index.ts`**
   - Fix: `(error as Error).message`

4. **`supabase/functions/gemini-document-analyzer/index.ts`**
   - Fix: `(error as Error).message`

### Fluxo Revisado

```text
Cliente                    Edge Function               Gemini API
  |                            |                          |
  |-- upload to Storage ------>|                          |
  |-- POST {fileUrl, size} --->|                          |
  |                            |-- fetch PDF from URL --->|
  |                            |                          |
  |                            |  if > 10MB:              |
  |                            |-- File API upload ------>|
  |                            |-- generateContent(uri)-->|
  |                            |                          |
  |                            |  if ≤ 10MB:              |
  |                            |-- generateContent(b64)-->|
  |                            |                          |
  |                            |<-- extracted text --------|
  |                            |-- generate embeddings--->|
  |                            |-- insert chunks -------->|
  |<-- success ----------------|                          |
```

