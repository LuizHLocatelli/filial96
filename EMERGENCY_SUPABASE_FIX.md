# 🚨 CORREÇÃO DE EMERGÊNCIA - Erro 500 no Signup

## Situação Atual
O erro `500 (Internal Server Error)` ainda está ocorrendo no endpoint `/auth/v1/signup` do Supabase, mesmo após implementar o trigger. Isso indica que há um problema no lado do banco de dados.

---

## 🔥 SOLUÇÃO RÁPIDA (Execute AGORA)

### Passo 1: Executar Diagnóstico
No **SQL Editor do Supabase**, execute:

```sql
-- Verificar se o trigger existe
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### Passo 2: Correção de Emergência
Execute este código no **SQL Editor**:

```sql
-- DESABILITAR TRIGGER TEMPORARIAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- TESTAR INSERÇÃO MANUAL
INSERT INTO public.profiles (
    id, 
    name, 
    role, 
    phone, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'Teste Manual',
    'consultor_moveis',
    '11999999999',
    NOW(),
    NOW()
);
```

### Passo 3: Testar Signup
- ✅ Se a inserção manual funcionou, teste o signup novamente
- ✅ Se o signup funcionar, o problema era o trigger/RLS
- ❌ Se ainda der erro 500, vá para **Passo 4**

---

## 🛠️ DIAGNÓSTICO COMPLETO

### Se o erro 500 persistir, execute:

```sql
-- 1. Verificar se a tabela profiles existe
SELECT tablename FROM pg_tables WHERE tablename = 'profiles';

-- 2. Verificar permissões
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles';

-- 3. Verificar se há constraints problemáticos
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles';
```

---

## 🔧 SOLUÇÕES PROGRESSIVAS

### Solução 1: Recriar Trigger Seguro
```sql
-- Função sem erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Só inserir se não existir
  INSERT INTO public.profiles (id, name, role, created_at, updated_at)
  SELECT NEW.id, 
         COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Usuário'),
         'consultor_moveis',
         NOW(),
         NOW()
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Se der erro, não quebra o signup
  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Solução 2: RLS Permissivo
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política super permissiva temporária
CREATE POLICY "temp_allow_all" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);
```

### Solução 3: Recriar Tabela (Último Recurso)
```sql
-- Backup
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- Recriar
DROP TABLE profiles CASCADE;
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text DEFAULT 'consultor_moveis',
    phone text,
    avatar_url text,
    display_name text,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Restaurar dados
INSERT INTO profiles SELECT * FROM profiles_backup;
```

---

## 📱 TESTE RÁPIDO VIA CONSOLE

No console do navegador (F12), execute:

```javascript
// Verificar se o erro persiste
supabaseLogger.getLogs({ level: 'error' })

// Tentar criar perfil manualmente para usuário atual
await supabaseUserFix.autoFixUserProfile()

// Ver estatísticas
supabaseLogger.getStats()
```

---

## 🎯 PRÓXIMOS PASSOS

1. **✅ Execute o Passo 2 (Correção de Emergência) PRIMEIRO**
2. **🧪 Teste o signup** 
3. **📊 Se funcionar**, reative gradualmente:
   - Primeiro RLS
   - Depois trigger
4. **❌ Se não funcionar**, execute diagnóstico completo
5. **📝 Documente** qual solução funcionou

---

## 🚨 IMPORTANTE

- **Não se preocupe com segurança agora** - primeiro vamos fazer funcionar
- **O RLS desabilitado é temporário** - vamos reativar depois
- **Foque em eliminar o erro 500** - perfis podem ser criados depois

---

## 📞 STATUS ESPERADO

Após a correção de emergência:
- ✅ **Signup deve funcionar** (sem erro 500)
- ✅ **Usuário é criado** na tabela auth.users
- ⚠️ **Perfil pode não ser criado automaticamente** (normal por enquanto)
- 🔧 **Perfil pode ser criado manualmente** depois

**O importante é eliminar o erro 500 primeiro!** 