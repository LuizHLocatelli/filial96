# Solução para Problema de CORS entre App e N8N

## 🚨 Problema Identificado

O erro de CORS estava ocorrendo quando o frontend (`https://juntosagenteresolve.com.br`) tentava fazer requisições diretamente para o webhook do N8N (`https://filial96.app.n8n.cloud/webhook/44a765ab-fb44-44c3-ab75-5ec334b9cda0`).

### Erro Original:
```
Access to fetch at 'https://filial96.app.n8n.cloud/webhook/44a765ab-fb44-44c3-ab75-5ec334b9cda0' 
from origin 'https://juntosagenteresolve.com.br' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Erro de Autenticação (Resolvido):
```
POST https://abpsafkioslfjqtgtvbi.supabase.co/functions/v1/n8n-proxy 401 (Unauthorized)
{"code":401,"message":"Missing authorization header"}
```

## ✅ Solução Implementada

### 1. Edge Function do Supabase como Proxy

Criamos uma **Edge Function no Supabase** que funciona como proxy entre o frontend e o N8N:

- **Arquivo**: `supabase/functions/n8n-proxy/index.ts`
- **URL da Edge Function**: `https://abpsafkioslfjqtgtvbi.supabase.co/functions/v1/n8n-proxy`

#### Características da Edge Function:
- ✅ **Headers CORS configurados** para permitir requisições do frontend
- ✅ **Tratamento de preflight requests** (OPTIONS)
- ✅ **Proxy transparente** para o webhook original do N8N
- ✅ **Tratamento de erros** adequado
- ✅ **Logging** para debugging
- ✅ **Autenticação Supabase** configurada

### 2. Atualização do Frontend

Modificamos o componente `ProductivityAssistant.tsx`:

- ✅ **Nova URL**: Agora usa a Edge Function ao invés do webhook direto
- ✅ **Constantes centralizadas**: Criamos `src/lib/constants.ts` para organizar URLs
- ✅ **Headers de autorização**: Incluímos as chaves anônimas do Supabase
- ✅ **Melhor tratamento de erro**: Detecta e reporta problemas de CORS especificamente
- ✅ **Fallback local**: Mantém respostas locais quando o N8N não está disponível

## 🔧 Arquitetura da Solução

```mermaid
graph TD
    A[Frontend - juntosagenteresolve.com.br] --> B[Edge Function - Supabase]
    B --> C[N8N Webhook - filial96.app.n8n.cloud]
    C --> B
    B --> A
    
    A -.-> D[Fallback Local]
    
    style B fill:#00D4AA
    style A fill:#FF6B6B
    style C fill:#4ECDC4
    style D fill:#FFE66D
```

### Fluxo de Requisição:
1. **Frontend** faz requisição para Edge Function com headers de autorização
2. **Edge Function** valida autorização e adiciona headers CORS
3. **Edge Function** faz proxy para N8N
4. **N8N** processa a requisição e retorna resposta
5. **Edge Function** retorna resposta com headers CORS para o frontend
6. Se falhar, **Frontend** usa resposta local de fallback

## 📁 Arquivos Modificados/Criados

### Criados:
- `supabase/functions/n8n-proxy/index.ts` - Edge Function proxy
- `supabase/functions/n8n-proxy/import_map.json` - Configurações da Edge Function
- `src/lib/constants.ts` - Constantes centralizadas

### Modificados:
- `src/components/moveis/hub-produtividade/components/chatbot/ProductivityAssistant.tsx`

## 🧪 Como Testar

1. **Abra o Hub de Produtividade** na aplicação
2. **Acesse o Assistente de Produtividade** (chatbot)
3. **Envie uma mensagem** (ex: "Olá")
4. **Verifique no console do navegador**:
   - ✅ Não deve aparecer erros de CORS
   - ✅ Não deve aparecer erros 401 (Unauthorized)
   - ✅ Deve mostrar logs da requisição bem-sucedida
   - ❌ Se houver erro, deve mostrar log específico

## 🔍 Debugging

### Logs Importantes:
```javascript
// Sucesso
✅ Requisição enviada via proxy para N8N

// Erro de CORS (não deve mais ocorrer)
⚠️  Problema de CORS detectado - verifique se a Edge Function está funcionando

// Erro de proxy
❌ Erro ao enviar mensagem para N8N via proxy
```

### Como Verificar se a Edge Function está funcionando:
```bash
# Teste direto da Edge Function (com autorização)
curl -X POST https://abpsafkioslfjqtgtvbi.supabase.co/functions/v1/n8n-proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicHNhZmtpb3NsZmpxdGd0dmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Njg3ODIsImV4cCI6MjA2MTU0NDc4Mn0.UTF4Gi6rDxQ2a3Pf4J2-7J0yPokcks6J8xO93GEhk-w" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicHNhZmtpb3NsZmpxdGd0dmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Njg3ODIsImV4cCI6MjA2MTU0NDc4Mn0.UTF4Gi6rDxQ2a3Pf4J2-7J0yPokcks6J8xO93GEhk-w" \
  -d '{"message": "teste", "timestamp": "2024-01-01T00:00:00.000Z", "source": "test"}'
```

## 🎯 Benefícios da Solução

1. **✅ Resolve CORS definitivamente**: Edge Function configura headers adequados
2. **🚀 Performance**: Supabase Edge Functions são rápidas e globalmente distribuídas
3. **🔒 Segurança**: Não expõe URL original do N8N no frontend
4. **🛠️ Manutenabilidade**: Centraliza configuração de proxy
5. **📊 Monitoramento**: Logs detalhados para debugging
6. **🔄 Fallback**: Sistema ainda funciona se N8N estiver indisponível
7. **🔐 Autenticação**: Usa chaves do Supabase para autorização segura

## 🔧 Configurações Técnicas

### Headers CORS Configurados:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

### Headers de Autorização do Frontend:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer [SUPABASE_ANON_KEY]',
  'apikey': '[SUPABASE_ANON_KEY]'
}
```

### Timeout:
- **30 segundos** para requisições ao N8N

## 🆘 Troubleshooting

### Se ainda houver problemas:

1. **Verifique se a Edge Function está ativa** (com autorização):
   ```bash
   curl -H "Authorization: Bearer [ANON_KEY]" \
        -H "apikey: [ANON_KEY]" \
        https://abpsafkioslfjqtgtvbi.supabase.co/functions/v1/n8n-proxy
   ```

2. **Verifique logs da Edge Function** no painel do Supabase

3. **Confirme se o N8N está respondendo**:
   ```bash
   curl -X POST https://filial96.app.n8n.cloud/webhook/44a765ab-fb44-44c3-ab75-5ec334b9cda0 \
     -H "Content-Type: application/json" \
     -d '{"message": "teste"}'
   ```

4. **Verifique se as constantes estão corretas** em `src/lib/constants.ts`

---

## 📝 Notas de Implementação

- A Edge Function foi deployada automaticamente no Supabase
- O projeto está usando o ID: `abpsafkioslfjqtgtvbi`
- A solução é retrocompatível e mantém o fallback local
- Não há custos adicionais significativos (Edge Functions têm free tier generoso)
- **IMPORTANTE**: As chaves anônimas do Supabase são públicas e seguras para uso no frontend 