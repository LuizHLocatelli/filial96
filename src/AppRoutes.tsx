
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import EntregasRetiradas from "./pages/EntregasRetiradas";
import Montagens from "./pages/Montagens";
import Garantias from "./pages/Garantias";
import Organizacao from "./pages/Organizacao";
import Cobrancas from "./pages/Cobrancas";
import PromotionalCards from "./pages/PromotionalCards";
import Crediario from "./pages/Crediario"; // Add import
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuth } from "./contexts/auth";

const AppRoutes = () => {
  const { isLoading } = useAuth();

  // Se a autenticação ainda estiver carregando, mostrar um spinner simples
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Rota de redefinição de senha - pública e acessível sem autenticação */}
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Rotas protegidas */}
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
      <Route 
        path="/cards-promocionais" 
        element={
          <ProtectedRoute>
            <AppLayout><PromotionalCards /></AppLayout>
          </ProtectedRoute>
        } 
      />
      {/* Add new route for Crediário */}
      <Route 
        path="/crediario" 
        element={
          <ProtectedRoute>
            <AppLayout><Crediario /></AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/perfil" 
        element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
