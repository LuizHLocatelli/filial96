
import { toast } from "@/hooks/use-toast";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  onError?: (error: any) => void;
}

export function handleError(
  error: any, 
  operation: string, 
  options: ErrorHandlerOptions = {}
) {
  const { 
    showToast = true, 
    fallbackMessage = "Ocorreu um erro inesperado",
    onError 
  } = options;

  console.error(`❌ Erro em ${operation}:`, error);
  
  const errorMessage = error?.message || fallbackMessage;
  
  if (showToast) {
    toast({
      title: `⚠️ Erro em ${operation}`,
      description: errorMessage,
      variant: "destructive",
    });
  }
  
  onError?.(error);
  return errorMessage;
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string,
  options?: ErrorHandlerOptions
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, operation, options);
      return null;
    }
  };
}
