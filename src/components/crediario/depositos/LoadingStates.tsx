import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton para o DailyStatusWidget
export function DailyStatusSkeleton() {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contador Regressivo Skeleton */}
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <Skeleton className="h-4 w-32 mx-auto mb-1" />
          <Skeleton className="h-8 w-24 mx-auto" />
        </div>

        {/* Progresso das Tarefas Skeleton */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Estatísticas Skeleton */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        </div>

        {/* Data atual Skeleton */}
        <div className="text-center pt-2 border-t">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para o QuickDepositForm
export function QuickDepositFormSkeleton() {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-36" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Area Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto mb-1" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>

        {/* Checklist Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Submit Button Skeleton */}
        <Skeleton className="h-12 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

// Skeleton para o Calendário
export function CalendarSkeleton() {
  return (
    <Card className="w-full border shadow-soft">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </div>

        {/* Estatísticas mensais Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3 bg-muted/30 rounded-lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Legenda Skeleton */}
        <div className="flex flex-wrap gap-2 mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="px-2 py-3 sm:px-4 sm:py-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Header dos dias */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-8 w-full" />
          ))}
          
          {/* Dias do calendário */}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={`day-${i}`} className="h-16 sm:h-20 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para Analytics
export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className={i === 3 ? "md:col-span-2" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente de Feedback de Sucesso com Animação
export function SuccessAnimation({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-green-600 animate-in zoom-in-95 duration-500 delay-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Sucesso!</h3>
          <p className="text-sm text-green-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Componente de Upload Progress
export function UploadProgress({ progress, fileName }: { progress: number; fileName: string }) {
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 min-w-[300px] z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Enviando arquivo</p>
          <p className="text-xs text-gray-500 truncate">{fileName}</p>
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para detectar online/offline
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Componente de Status Offline
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <p className="font-medium">Modo Offline</p>
          <p className="text-sm">Sem conexão com a internet. Os dados serão salvos quando voltar online.</p>
        </div>
      </div>
    </div>
  );
} 