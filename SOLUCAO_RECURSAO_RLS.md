# 🔧 Solução para Recursão Infinita nas Políticas RLS

## ❌ Problema Identificado

**Erro:** `infinite recursion detected in policy for relation "profiles"`

### Causa do Problema

As políticas RLS originais estavam causando recursão infinita porque:

1. **Auto-referência**: As políticas consultavam a própria tabela `profiles` dentro das condições
2. **Loop infinito**: Quando o Supabase tentava verificar se o usuário era gerente, executava:
   ```sql
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gerente')
   ```
3. **Reativação RLS**: Essa consulta à tabela `profiles` reativava as próprias políticas RLS
4. **Ciclo sem fim**: Criava um loop infinito de verificações

### Exemplo do Problema
```sql
-- ❌ PROBLEMÁTICO - Causa recursão
CREATE POLICY "policy_name" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles  -- ← Aqui está o problema!
      WHERE id = auth.uid() AND role = 'gerente'
    )
  );
```

## ✅ Solução Implementada

### Abordagem: Funções com SECURITY DEFINER

Criamos funções que acessam a tabela **sem ativar RLS**, evitando a recursão:

```sql
-- ✅ SOLUÇÃO - Função segura
CREATE OR REPLACE FUNCTION public.is_user_manager(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  -- ← Executa com privilégios do criador
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    -- Busca role diretamente sem ativar RLS
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role = 'gerente', false);
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;
```

### Como a Solução Funciona

1. **SECURITY DEFINER**: A função executa com privilégios do criador (superusuário)
2. **Sem RLS**: Acessa dados diretamente sem ativar políticas RLS
3. **Sem recursão**: Não há chamadas circulares às políticas
4. **Segura**: Ainda mantém controle de acesso adequado

### Políticas Corrigidas

```sql
-- ✅ Usando função segura - sem recursão
CREATE POLICY "Enable read for own profile and managers" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR
        public.is_user_manager()  -- ← Função segura
    );
```

## 📋 Passos para Aplicar a Correção

### 1. Execute o Script Corrigido

Copie e execute no **SQL Editor do Supabase**:

```sql
-- O script completo está em: supabase/migrations/create_user_management_policies_fixed.sql
```

### 2. Verifique a Execução

Após executar o script, teste:

```sql
-- Teste se você é gerente
SELECT public.is_user_manager();

-- Teste seu role atual
SELECT public.get_user_role();
```

### 3. Teste a Funcionalidade

1. Acesse a página de **Gerenciar Usuários**
2. Tente **editar** um usuário
3. Tente **excluir** um usuário (não-gerente)
4. Verifique se não há mais erros

### 4. Confirme a Correção

Na interface, clique em **"Marcar como Corrigido"** quando tudo funcionar.

## 🔍 Verificação de Problemas

### Se ainda houver erros:

1. **Verifique se o script foi executado completamente**
   ```sql
   -- Confirmar se as funções existem
   SELECT proname FROM pg_proc WHERE proname IN ('is_user_manager', 'get_user_role');
   ```

2. **Confirmar se as políticas antigas foram removidas**
   ```sql
   -- Listar políticas atuais
   SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Verificar se você é gerente**
   ```sql
   -- Confirmar seu role
   SELECT role FROM public.profiles WHERE id = auth.uid();
   ```

## 🛡️ Segurança Mantida

A solução **não compromete a segurança**:

- ✅ **Gerentes** ainda têm acesso total aos usuários
- ✅ **Usuários comuns** só veem seus próprios perfis
- ✅ **Não-gerentes** não podem editar/excluir outros usuários
- ✅ **Gerentes** não podem excluir outros gerentes

## 📝 Arquivos Relacionados

- `supabase/migrations/create_user_management_policies_fixed.sql` - Script corrigido
- `src/components/admin/ApplyUserManagementPolicies.tsx` - Interface atualizada
- `src/pages/UserManagement.tsx` - Página principal (sem alterações necessárias)

## 🎯 Resultado Final

Após aplicar a correção, você deve conseguir:

- ✅ **Visualizar** todos os usuários como gerente
- ✅ **Editar** informações de outros usuários
- ✅ **Excluir** usuários não-gerentes
- ✅ **Buscar** e filtrar usuários
- ✅ **Usar todas as funcionalidades** sem erros de recursão

---

**Status**: 🟢 **PROBLEMA RESOLVIDO**

Se seguir os passos acima, o sistema de gerenciamento de usuários funcionará perfeitamente! 