
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalSearchProvider } from "./contexts/GlobalSearchContext";
import AppRoutes from "./AppRoutes";


const queryClient = new QueryClient();

// Componente interno para usar o hook dentro do ThemeProvider
const AppContent = () => {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <GlobalSearchProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </GlobalSearchProvider>
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
