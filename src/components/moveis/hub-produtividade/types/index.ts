
// Re-export all types from the main types file and add new ones
export * from '../types';

export interface QueryError {
  message: string;
  code?: string;
  details?: string;
}

export interface RefetchFunction {
  (): Promise<void>;
}

export interface DataHookResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  refetch: RefetchFunction;
}
