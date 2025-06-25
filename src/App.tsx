import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalSearchProvider } from "./contexts/GlobalSearchContext";
import AppRoutes from "./AppRoutes";
import { LazyLoadingDashboard } from "./components/debug/LazyLoadingDashboard";
import { NetworkStatusIndicator } from "./components/pwa/NetworkStatusIndicator";
import { PWAOnboarding } from "./components/pwa/PWAOnboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <GlobalSearchProvider>
              <NetworkStatusIndicator />
              <PWAOnboarding />
              <Toaster />
              <Sonner />
              <AppRoutes />
              <LazyLoadingDashboard />
            </GlobalSearchProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
