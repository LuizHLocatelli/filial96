
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalSearchProvider } from "./contexts/GlobalSearchContext";
import { PWAInstallBanner } from "./components/pwa/PWAInstallBanner";
import AppRoutes from "./AppRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <GlobalSearchProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
              <PWAInstallBanner />
            </GlobalSearchProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
