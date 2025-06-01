# 🔧 DEBUG: Problema de Exclusão de Conta

## Status Atual

✅ **Correções Implementadas:**
- Política RLS da tabela `activities` corrigida
- Função RPC `delete_user_account` melhorada (29 tabelas cobertas)
- Edge Function `delete-user` aprimorada com logs detalhados
- Fluxo de exclusão simplificado (não executa RPC separadamente)

❌ **Ainda com erro:** `FunctionsHttpError: Edge Function returned a non-2xx status code`

---

## 🧪 Como Testar o Sistema

### 1. **Teste Seguro no Console** (Recomendado)

Abra o **Console do Navegador** (F12) e execute:

```javascript
// Testar função de debug (verificar variáveis de ambiente)
window.testDeleteAccount()

// Testar função RPC separadamente
window.testDeleteUserRPC()
```

### 2. **Verificar Logs da Edge Function**

No **Supabase Dashboard > Edge Functions > delete-user > Logs**, procure por:

```
🗑️ Attempting to delete user account: [user_id]
✅ User authorized: [email]
🧹 Cleaning user data...
✅ User data cleaned: [result]
🗂️ Deleting auth user...
✅ User account deleted successfully: [user_id]
```

### 3. **Teste Manual da Função RPC**

No **Supabase SQL Editor**, execute:

```sql
-- Deve retornar erro de não autorizado (isso é esperado)
SELECT public.delete_user_account();
```

---

## 🐛 Possíveis Causas do Erro

### 1. **Variáveis de Ambiente Faltando**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. **Problemas de Autenticação**
- JWT token inválido ou expirado
- Header de autorização malformado

### 3. **Erro na Função RPC**
- Política RLS bloqueando operação
- Constraint violation em foreign keys

### 4. **Timeout ou Limite de Recursos**
- Função executando por muito tempo
- Muitos dados para processar

---

## 🔍 Debugging Passo a Passo

### Passo 1: Verificar se Edge Function está Online
```javascript
// No console do navegador:
fetch('https://abpsafkioslfjqtgtvbi.supabase.co/functions/v1/delete-user-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session?.access_token
  },
  body: JSON.stringify({ test: true })
})
.then(r => r.json())
.then(console.log)
```

### Passo 2: Verificar Token de Autenticação
```javascript
// Verificar se token está válido:
const session = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Token:', session.data.session?.access_token);
```

### Passo 3: Testar Função RPC Isoladamente
```javascript
// Testar RPC diretamente:
const { data, error } = await supabase.rpc('delete_user_account');
console.log('RPC Result:', { data, error });
```

---

## ⚡ Soluções Imediatas

### Solução 1: Reautenticar
```javascript
// Fazer logout e login novamente para renovar token:
await supabase.auth.signOut();
// Fazer login novamente
```

### Solução 2: Verificar Headers
No **Network Tab** do DevTools, verifique se a requisição para a Edge Function inclui:
- `Authorization: Bearer [token]`
- `Content-Type: application/json`

### Solução 3: Teste com Usuário Diferente
Criar conta de teste e tentar exclusão para verificar se é problema específico do usuário.

---

## 📞 Próximos Passos

1. **Execute os testes no console** primeiro
2. **Verifique os logs** da Edge Function
3. **Capture o erro específico** no Network Tab
4. **Reporte o erro detalhado** com:
   - Logs do console
   - Response da Edge Function
   - Detalhes da requisição HTTP

---

## 📋 Checklist de Verificação

- [ ] Funções de teste executam sem erro no console
- [ ] Token de autenticação está válido
- [ ] Edge Function `delete-user-test` responde corretamente
- [ ] RPC `delete_user_account` retorna erro esperado (não autorizado)
- [ ] Headers HTTP estão corretos na requisição
- [ ] Logs da Edge Function mostram onde está falhando

**Com essas informações, conseguirei identificar a causa exata do problema!** 🎯 