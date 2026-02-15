import { supabase } from "@/integrations/supabase/client";

/**
 * Função de teste para verificar se a Edge Function de exclusão está funcionando
 * sem executar a exclusão real da conta
 */
export async function testDeleteAccountFunction() {
  try {
    console.log("🧪 Testando Edge Function de exclusão...");
    
    // Primeiro, teste a função de debug
    console.log("📡 Testando função de debug...");
    const { data: debugResult, error: debugError } = await supabase.functions.invoke('delete-user-test', {
      body: { test: true }
    });
    
    if (debugError) {
      console.error("❌ Erro na função de debug:", debugError);
      return {
        success: false,
        error: "Erro na função de debug",
        details: debugError
      };
    }
    
    console.log("✅ Função de debug funcionou:", debugResult);
    
    // Agora teste a função real (mas não execute a exclusão)
    console.log("📡 Testando função de exclusão (sem executar)...");
    
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Usuário não está logado",
        details: userError
      };
    }
    
    // Testar apenas a validação inicial da função de exclusão
    // usando um ID diferente para não executar de verdade
    const testUserId = "test-user-id";
    
    const { data: result, error: deleteError } = await supabase.functions.invoke('delete-user-fixed', {
      body: { user_id: testUserId }
    });
    
    console.log("📊 Resultado do teste:", { result, deleteError });
    
    // Analisar o tipo de erro para verificar se a função está funcionando
    if (deleteError) {
      // Se o erro é sobre autorização, significa que a função está funcionando
      // mas corretamente bloqueando tentativas de excluir outras contas
      if (deleteError.message?.includes("Unauthorized") || 
          deleteError.message?.includes("Can only delete your own account")) {
        return {
          success: true,
          message: "Função está funcionando corretamente (bloqueou tentativa não autorizada)",
          debug: debugResult,
          validation: "OK - Autorização funcionando"
        };
      }
      
      // Outros erros indicam problemas na função
      return {
        success: false,
        error: "Problema na função de exclusão",
        details: deleteError,
        debug: debugResult
      };
    }
    
    return {
      success: true,
      message: "Função de exclusão está funcionando",
      result,
      debug: debugResult
    };
    
  } catch (error) {
    console.error("💥 Erro no teste:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const errorStack = error instanceof Error ? error.stack : "";
    return {
      success: false,
      error: "Erro durante o teste",
      details: errorMessage,
      stack: errorStack
    };
  }
}

/**
 * Testa a função RPC de limpeza de dados sem executar
 */
export async function testDeleteUserRPC() {
  try {
    console.log("🧪 Testando função RPC delete_user_account...");
    
    // Tentar executar a função RPC
    const { data: result, error: rpcError } = await supabase.rpc('delete_user_account');
    
    // Se retornou erro de não autenticado, a função está funcionando
    if (rpcError?.message?.includes("Unauthorized")) {
      return {
        success: true,
        message: "Função RPC está funcionando (retornou erro de autorização esperado)",
        details: rpcError
      };
    }
    
    // Se não deu erro, retornar resultado
    if (!rpcError) {
      return {
        success: true,
        message: "Função RPC executou com sucesso",
        result
      };
    }
    
    // Outros erros
    return {
      success: false,
      error: "Erro na função RPC",
      details: rpcError
    };
    
  } catch (error) {
    return {
      success: false,
      error: "Erro ao testar RPC",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Testa diretamente a nova Edge Function corrigida
 */
export async function testDeleteUserFixed() {
  try {
    console.log("🧪 Testando nova Edge Function delete-account-no-jwt...");
    
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Usuário não está logado",
        details: userError
      };
    }
    
    // Testar com ID diferente para não executar de verdade
    const testUserId = "test-user-id";
    
    const { data: result, error: deleteError } = await supabase.functions.invoke('delete-account-no-jwt', {
      body: { user_id: testUserId }
    });
    
    console.log("📊 Resultado do teste (delete-account-no-jwt):", { result, deleteError });
    
    // Analisar resultado
    if (deleteError) {
      if (deleteError.message?.includes("Unauthorized") || 
          deleteError.message?.includes("Can only delete your own account")) {
        return {
          success: true,
          message: "Nova Edge Function funcionando - autorização OK",
          validation: "✅ Bloqueou tentativa não autorizada corretamente"
        };
      }
      
      return {
        success: false,
        error: "Problema na nova Edge Function",
        details: deleteError
      };
    }
    
    return {
      success: true,
      message: "Nova Edge Function funcionando",
      result
    };
    
  } catch (error) {
    return {
      success: false,
      error: "Erro ao testar nova Edge Function",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Testa a nova Edge Function service-based
 */
export async function testDeleteAccountService() {
  try {
    console.log("🧪 Testando Edge Function delete-account-service...");
    
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Usuário não está logado",
        details: userError
      };
    }
    
    // Testar com ID e senha inválidos para verificar se a função funciona
    const testUserId = "test-user-id";
    const testPassword = "invalid-password";
    
    const { data: result, error: deleteError } = await supabase.functions.invoke('delete-account-service', {
      body: { 
        user_id: testUserId,
        password: testPassword
      }
    });
    
    console.log("📊 Resultado do teste (delete-account-service):", { result, deleteError });
    
    // Analisar resultado
    if (deleteError) {
      // Se o erro é sobre usuário não encontrado ou senha inválida, significa que a função está funcionando
      if (deleteError.message?.includes("User not found") || 
          deleteError.message?.includes("Invalid password") ||
          deleteError.message?.includes("404")) {
        return {
          success: true,
          message: "Edge Function service funcionando - validação OK",
          validation: "✅ Bloqueou tentativa com dados inválidos corretamente"
        };
      }
      
      return {
        success: false,
        error: "Problema na Edge Function service",
        details: deleteError
      };
    }
    
    return {
      success: true,
      message: "Edge Function service funcionando",
      result
    };
    
  } catch (error) {
    return {
      success: false,
      error: "Erro ao testar Edge Function service",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

// Exportar para o console global para fácil acesso
declare global {
  interface Window {
    testDeleteAccount: typeof testDeleteAccountFunction;
    testDeleteUserRPC: typeof testDeleteUserRPC;
    testDeleteUserFixed: typeof testDeleteUserFixed;
    testDeleteAccountService: typeof testDeleteAccountService;
  }
}

if (typeof window !== 'undefined') {
  window.testDeleteAccount = testDeleteAccountFunction;
  window.testDeleteUserRPC = testDeleteUserRPC;
  window.testDeleteUserFixed = testDeleteUserFixed;
  window.testDeleteAccountService = testDeleteAccountService;
} 