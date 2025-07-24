
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalSearchProvider } from "./contexts/GlobalSearchContext";
import { useState } from 'react';
import AppRoutes from "./AppRoutes";
import { ChatBotModal } from './components/chatbot';
import { LazyLoadingDashboard } from "./components/debug/LazyLoadingDashboard";
import { PWANotificationPrompt } from "./components/pwa/PWANotificationPrompt";
import { ForceUpdateButton } from "./components/pwa/ForceUpdateButton";
import useStatusBarTheme from "./hooks/useStatusBarTheme";
import "./styles/pwa-status-bar.css";

const queryClient = new QueryClient();

// Componente interno para usar o hook dentro do ThemeProvider
const AppContent = () => {
  useStatusBarTheme(); // Aplica a cor da status bar automaticamente
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <GlobalSearchProvider>
            <PWANotificationPrompt />
            <Toaster />
            <Sonner />
            <AppRoutes isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
            <ChatBotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <LazyLoadingDashboard />
            <ForceUpdateButton />
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
