-- QUERIES DE DIAGNÓSTICO - Execute no SQL Editor do Supabase

-- 1. Verificar se o trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing,
  action_statement,
  action_condition
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Verificar se a função existe
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Verificar políticas RLS da tabela profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 6. Testar se conseguimos inserir na tabela profiles manualmente
-- (Execute apenas se as verificações acima mostrarem que está tudo ok)
/*
INSERT INTO public.profiles (
  id, 
  name, 
  role, 
  phone, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  'Teste Usuario',
  'consultor_moveis',
  '11999999999',
  NOW(),
  NOW()
);
*/

-- 7. Verificar logs de erro do PostgreSQL (se tiver acesso)
-- SELECT * FROM pg_stat_statements WHERE query LIKE '%profiles%' ORDER BY last_exec_time DESC LIMIT 5; 