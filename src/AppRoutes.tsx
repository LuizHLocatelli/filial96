import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Crediario from "./pages/Crediario";
import Moveis from "./pages/Moveis";
import Moda from "./pages/Moda";
import HubProdutividade from "./pages/HubProdutividade";
import Atividades from "./pages/Atividades";
import PdfViewerPage from "./pages/PdfViewerPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuth } from "./contexts/auth";
import PromotionalCards from "./pages/PromotionalCards";

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
            <AppLayout><HubProdutividade /></AppLayout>
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
      <Route 
        path="/crediario" 
        element={
          <ProtectedRoute>
            <AppLayout><Crediario /></AppLayout>
          </ProtectedRoute>
        } 
      />
      {/* Nova rota para a página Móveis */}
      <Route 
        path="/moveis" 
        element={
          <ProtectedRoute>
            <AppLayout><Moveis /></AppLayout>
          </ProtectedRoute>
        } 
      />
      {/* Nova rota para a página Moda */}
      <Route 
        path="/moda" 
        element={
          <ProtectedRoute>
            <AppLayout><Moda /></AppLayout>
          </ProtectedRoute>
        } 
      />
      {/* Nova rota para a página de Atividades */}
      <Route 
        path="/atividades" 
        element={
          <ProtectedRoute>
            <AppLayout><Atividades /></AppLayout>
          </ProtectedRoute>
        } 
      />
      {/* Add new route for PDF viewer */}
      <Route 
        path="/pdf-viewer" 
        element={
          <ProtectedRoute>
            <AppLayout><PdfViewerPage /></AppLayout>
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
      {/* Nova rota para gerenciamento de usuários - apenas gerentes */}
      <Route 
        path="/gerenciar-usuarios" 
        element={
          <ProtectedRoute>
            <AppLayout><UserManagement /></AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
