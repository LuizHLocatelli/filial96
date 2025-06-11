import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuth } from "./contexts/auth";

// Lazy loading pages
const Crediario = lazy(() => import('./pages/Crediario'));
const Moveis = lazy(() => import('./pages/Moveis'));
const Moda = lazy(() => import('./pages/Moda'));
const HubProdutividade = lazy(() => import('./pages/HubProdutividade'));
const Atividades = lazy(() => import('./pages/Atividades'));
const PdfViewerPage = lazy(() => import('./pages/PdfViewerPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Auth = lazy(() => import('./pages/Auth'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const PromotionalCards = lazy(() => import('./pages/PromotionalCards'));
const PainelMetas = lazy(() => import('./pages/PainelMetas'));

const AppRoutes = () => {
  const { user } = useAuth();

  const loadingSpinner = (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue-600"></div>
    </div>
  );
  
  return (
    <Suspense fallback={loadingSpinner}>
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
        <Route path="/painel-metas" element={<ProtectedRoute><AppLayout><PainelMetas /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
