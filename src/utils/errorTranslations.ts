/**
 * Traduções para mensagens de erro comuns do Supabase e outras APIs
 */

export const ERROR_TRANSLATIONS: Record<string, string> = {
  // Mensagens de autenticação
  "Invalid login credentials": "Credenciais de login inválidas",
  "Email not confirmed": "E-mail não confirmado",
  "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
  "User not found": "Usuário não encontrado",
  "Invalid email": "E-mail inválido",
  "Too many requests": "Muitas tentativas",
  "Unauthorized": "Não autorizado",
  "Invalid password": "Senha inválida",
  "User not authenticated": "Usuário não autenticado",
  
  // Mensagens de banco de dados
  "Database error": "Erro no banco de dados",
  "Network error": "Erro de rede",
  "Connection failed": "Falha na conexão",
  
  // Mensagens de validação
  "Invalid format": "Formato inválido",
  "File too large": "Arquivo muito grande",
  "Invalid file type": "Tipo de arquivo inválido",
  
  // Mensagens de API
  "Internal server error": "Erro interno do servidor",
  "Service temporarily unavailable": "Serviço temporariamente indisponível",
  "Rate limit exceeded": "Limite de tentativas excedido",
  
  // Mensagens específicas do app
  "Can only delete your own account": "Você só pode excluir sua própria conta",
  "Edge Function returned a non-2xx status code": "Erro na função do servidor",
  "FunctionsHttpError": "Erro na comunicação com o servidor",
};

/**
 * Traduz uma mensagem de erro para português brasileiro
 * @param error - Mensagem de erro original ou objeto de erro
 * @returns Mensagem traduzida ou mensagem original se não houver tradução
 */
export function translateError(error: string | Error | { message?: string }): string {
  let errorMessage: string;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && error.message) {
    errorMessage = error.message;
  } else {
    return "Erro desconhecido";
  }
  
  // Procura por traduções exatas primeiro
  for (const [originalMessage, translation] of Object.entries(ERROR_TRANSLATIONS)) {
    if (errorMessage.includes(originalMessage)) {
      return translation;
    }
  }
  
  // Se não encontrou tradução, retorna a mensagem original
  return errorMessage;
}

/**
 * Traduz e formata uma mensagem de erro para exibição ao usuário
 * @param error - Erro original
 * @param fallbackMessage - Mensagem padrão se não conseguir traduzir
 * @returns Mensagem formatada para o usuário
 */
export function formatErrorForUser(
  error: string | Error | { message?: string }, 
  fallbackMessage: string = "Ocorreu um erro inesperado"
): string {
  const translated = translateError(error);
  
  // Se a tradução é igual à mensagem original em inglês, usa o fallback
  if (translated === (typeof error === 'string' ? error : error instanceof Error ? error.message : error?.message)) {
    // Verifica se é uma mensagem técnica em inglês
    if (translated.match(/^[A-Za-z\s]+$/)) {
      return fallbackMessage;
    }
  }
  
  return translated;
} 