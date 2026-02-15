
import { toast } from "@/hooks/use-toast";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  onError?: (error: unknown) => void;
}

export function handleError(
  error: unknown, 
  operation: string, 
  options: ErrorHandlerOptions = {}
) {
  const { 
    showToast = true, 
    fallbackMessage = "Ocorreu um erro inesperado",
    onError 
  } = options;

  console.error(`❌ Erro em ${operation}:`, error);
  
  const errorMessage = error instanceof Error ? error.message : fallbackMessage;
  
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

export function withErrorHandling<T extends unknown[], R>(
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
