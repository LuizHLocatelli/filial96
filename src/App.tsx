
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import EntregasRetiradas from "./pages/EntregasRetiradas";
import Montagens from "./pages/Montagens";
import Garantias from "./pages/Garantias";
import Organizacao from "./pages/Organizacao";
import Cobrancas from "./pages/Cobrancas";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AppLayout><Dashboard /></AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/entregas" 
                element={
                  <ProtectedRoute>
                    <AppLayout><EntregasRetiradas /></AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/montagens" 
                element={
                  <ProtectedRoute>
                    <AppLayout><Montagens /></AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/garantias" 
                element={
                  <ProtectedRoute>
                    <AppLayout><Garantias /></AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/organizacao" 
                element={
                  <ProtectedRoute>
                    <AppLayout><Organizacao /></AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cobrancas" 
                element={
                  <ProtectedRoute>
                    <AppLayout><Cobrancas /></AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
