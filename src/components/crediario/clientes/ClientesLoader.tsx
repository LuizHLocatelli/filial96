
import { ClienteFormValues } from "../types";

interface ClientesLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function ClientesLoader({ isLoading, children }: ClientesLoaderProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
