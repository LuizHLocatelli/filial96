
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/theme";
import AppRoutes from "./AppRoutes";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos antes de considerar stale
      gcTime: 1000 * 60 * 10, // 10 minutos no cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente interno para usar o hook dentro do ThemeProvider
const AppContent = () => {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Sonner />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
