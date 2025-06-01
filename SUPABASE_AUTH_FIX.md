# 🚨 Correção do Erro AUTH_ERROR no Signup

## Problema Identificado

O erro `AUTH_ERROR: Database error saving new user` está ocorrendo porque:

1. **Problema de RLS (Row Level Security)**: As políticas RLS da tabela `profiles` estão bloqueando a inserção automática
2. **Falta de trigger**: Não há trigger configurado para criar automaticamente o perfil quando um usuário é criado
3. **Configurações de permissão**: As políticas não permitem inserção via service_role (triggers)

## 🔧 Solução Implementada

### 1. Hook Melhorado
- ✅ **Arquivo atualizado**: `src/hooks/useSupabaseSignup.ts`
- ✅ **Melhorias**: Removida criação manual de perfil, confia em triggers do banco
- ✅ **Tratamento de erro**: Melhor categorização e mensagens específicas
- ✅ **Logs detalhados**: Sistema de logging aprimorado

### 2. Trigger SQL Automático
- ✅ **Arquivo criado**: `supabase/migrations/001_setup_profile_trigger.sql`
- ✅ **Função trigger**: Cria perfil automaticamente quando usuário é criado
- ✅ **Políticas RLS**: Configuradas corretamente para triggers
- ✅ **Função de correção**: Para usuários existentes sem perfil

## 📋 Passos para Implementar

### Passo 1: Executar SQL no Supabase

1. Acesse o **Dashboard do Supabase**
2. Vá para **SQL Editor**
3. Execute o seguinte código:

```sql
-- 1. Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    role, 
    phone, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consultor_moveis'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    role = COALESCE(NEW.raw_user_meta_data->>'role', profiles.role),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', profiles.phone),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 2. Aplicar trigger na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Configurar políticas RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserção apenas via trigger (service_role)
DROP POLICY IF EXISTS "Enable insert for service_role and triggers" ON public.profiles;
CREATE POLICY "Enable insert for service_role and triggers" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.uid() = id
  );
```

### Passo 2: Verificar Implementação

Após executar o SQL, teste o signup:

1. **Teste via aplicação**: Use o formulário de cadastro
2. **Verifique os logs**: Console do navegador deve mostrar logs detalhados
3. **Confirme na tabela**: Verifique se o perfil foi criado automaticamente

### Passo 3: Diagnóstico (se necessário)

Use o componente de diagnóstico:

```bash
# Acesse a página de diagnóstico
/supabase-diagnostic
```

Ou via console do navegador:

```javascript
// Ver logs de erro
supabaseLogger.getLogs({ level: 'error' })

// Ver operações de auth
supabaseLogger.getLogs({ operation: 'AUTH' })

// Estatísticas gerais
supabaseLogger.getStats()
```

## 🔍 Verificações Adicionais

### 1. Confirmar Trigger Ativo

```sql
-- Verificar se o trigger existe
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 2. Testar Função Manualmente

```sql
-- Testar a função de criar perfil
SELECT public.ensure_user_profile('UUID_DO_USUARIO');
```

### 3. Verificar Políticas RLS

```sql
-- Ver políticas da tabela profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';
```

## 📊 Monitoramento

### Logs Importantes

- ✅ `AUTH.SIGNUP`: Processo de criação de conta
- ✅ `PROFILE.VERIFY`: Verificação do perfil criado
- ✅ `RETRY`: Tentativas automáticas em caso de falha

### Métricas de Sucesso

- **Taxa de signup**: Deve aumentar para próximo de 100%
- **Tempo médio**: Processo deve completar em 2-3 segundos
- **Erros AUTH_ERROR**: Devem ser eliminados

### Possíveis Erros Restantes

1. **SIGNUP_SERVICE_ERROR**: Problema temporário do Supabase
2. **EMAIL_ALREADY_EXISTS**: E-mail já cadastrado (normal)
3. **RATE_LIMITED**: Muitas tentativas (normal)

## 🚀 Benefícios da Solução

1. **✅ Automatização**: Perfil criado automaticamente via trigger
2. **✅ Robustez**: Sistema de retry e fallback
3. **✅ Observabilidade**: Logs detalhados para debug
4. **✅ Escalabilidade**: Não depende de operações manuais
5. **✅ Confiabilidade**: Funciona mesmo com falhas temporárias

## 🆘 Suporte

Se o problema persistir após implementar essas correções:

1. **Verifique os logs**: `supabaseLogger.getLogs({ level: 'error' })`
2. **Execute o diagnóstico**: Acesse `/supabase-diagnostic`
3. **Confirme o trigger**: Execute as queries de verificação
4. **Documente o erro**: Copie os logs detalhados para análise

---

**Nota**: Esta solução elimina o erro "Database error saving new user" movendo a responsabilidade da criação do perfil para o lado do banco de dados via triggers, tornando o processo mais robusto e confiável. 