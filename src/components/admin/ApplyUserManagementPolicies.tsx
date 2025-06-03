import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, CheckCircle, AlertTriangle, Database, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function ApplyUserManagementPolicies() {
  const { profile } = useAuth();
  const [isApplied, setIsApplied] = useState(false);

  const isManager = profile?.role === 'gerente';

  const userManagementPoliciesSQL = `-- VERSÃO CORRIGIDA - Políticas RLS sem recursão infinita
-- Execute este script para corrigir o problema de recursão

-- 1. Primeiro, remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Gerentes podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gerentes podem atualizar outros perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gerentes podem excluir perfis não-gerentes" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- 2. Criar função segura para verificar se usuário é gerente (sem RLS)
CREATE OR REPLACE FUNCTION public.is_user_manager(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    -- Buscar role diretamente da tabela sem ativar RLS
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role = 'gerente', false);
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- 3. Criar função para obter role do usuário atual (sem RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, '');
EXCEPTION
    WHEN OTHERS THEN
        RETURN '';
END;
$$;

-- 4. Políticas simplificadas para SELECT (visualização)
CREATE POLICY "Enable read for own profile and managers" ON public.profiles
    FOR SELECT USING (
        -- Usuário pode ver seu próprio perfil
        auth.uid() = id OR
        -- Gerentes podem ver todos (usando função segura)
        public.is_user_manager()
    );

-- 5. Política para UPDATE (edição)
CREATE POLICY "Enable update for own profile and managers" ON public.profiles
    FOR UPDATE USING (
        -- Usuário pode atualizar seu próprio perfil
        auth.uid() = id OR
        -- Gerentes podem atualizar outros perfis
        public.is_user_manager()
    );

-- 6. Política para DELETE (exclusão) - mais restritiva
CREATE POLICY "Enable delete for managers only" ON public.profiles
    FOR DELETE USING (
        -- Apenas gerentes podem excluir
        public.is_user_manager() AND
        -- Não podem excluir outros gerentes
        public.get_user_role(id) != 'gerente'
    );

-- 7. Política para INSERT (criação de perfis)
CREATE POLICY "Enable insert for authenticated users" ON public.profiles
    FOR INSERT WITH CHECK (
        -- Usuário pode criar seu próprio perfil
        auth.uid() = id OR
        -- Gerentes podem criar perfis para outros
        public.is_user_manager()
    );

-- 8. Garantir que RLS está ativo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Comentários das funções
COMMENT ON FUNCTION public.is_user_manager(uuid) IS 'Verifica se o usuário é gerente sem causar recursão RLS';
COMMENT ON FUNCTION public.get_user_role(uuid) IS 'Obtém o role do usuário sem causar recursão RLS';

-- 10. Testar as funções (descomente para verificar)
-- SELECT public.is_user_manager(); -- Deve retornar true se você for gerente
-- SELECT public.get_user_role(); -- Deve retornar seu role atual`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userManagementPoliciesSQL);
      toast({
        title: "Script corrigido copiado!",
        description: "O script SQL corrigido foi copiado para sua área de transferência.",
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o script. Copie manualmente do arquivo.",
        variant: "destructive",
      });
    }
  };

  const markAsConfigured = () => {
    setIsApplied(true);
    toast({
      title: "Configuração marcada como concluída",
      description: "O sistema de gerenciamento de usuários está configurado.",
    });
  };

  if (!isManager) {
    return null;
  }

  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-red-600" />
            Configuração Corrigida - Resolver Recursão
          </CardTitle>
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <Crown className="w-3 h-3 mr-1" />
            Correção Necessária
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800 font-medium">
              PROBLEMA DETECTADO: Recursão infinita nas políticas RLS
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            O erro "infinite recursion detected" acontece porque as políticas estão consultando 
            a própria tabela profiles. Use o script corrigido abaixo para resolver o problema.
          </p>
          
          {!isApplied ? (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                Execute o script corrigido para resolver a recursão
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Políticas corrigidas aplicadas com sucesso
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Passos para Corrigir:</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Acesse o <strong>SQL Editor do Supabase</strong></li>
            <li>Copie o script corrigido abaixo</li>
            <li>Execute o script (ele vai remover as políticas problemáticas)</li>
            <li>Verifique se não há erros na execução</li>
            <li>Teste editando um usuário para confirmar que funciona</li>
            <li>Clique em "Marcar como Corrigido" se tudo funcionar</li>
          </ol>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Script SQL Corrigido:</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <Copy className="w-3 h-3" />
              Copiar Script Corrigido
            </Button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{userManagementPoliciesSQL}</pre>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={markAsConfigured}
            disabled={isApplied}
            className="flex-1"
            variant={isApplied ? "secondary" : "default"}
          >
            {isApplied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Corrigido
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Marcar como Corrigido
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
          <strong>🔧 Solução:</strong> O script corrigido usa funções com SECURITY DEFINER que acessam 
          a tabela sem ativar RLS, evitando a recursão infinita.
        </div>

        <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded border border-green-200">
          <strong>✅ Teste:</strong> Após executar o script, tente editar um usuário. Se funcionar sem erros, 
          o problema foi resolvido!
        </div>
      </CardContent>
    </Card>
  );
} 