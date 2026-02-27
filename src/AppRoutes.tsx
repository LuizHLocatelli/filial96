import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuth } from "./contexts/auth";
import CalculadoraIgreenWrapper from "./pages/CalculadoraIgreenWrapper";

// Lazy load das páginas principais
const HubProdutividade = lazy(() => import("./pages/HubProdutividade"));
const Crediario = lazy(() => import("./pages/Crediario"));
const Moveis = lazy(() => import("./pages/Moveis"));
const Moda = lazy(() => import("./pages/Moda"));

const PdfViewerPage = lazy(() => import("./pages/PdfViewerPage"));
const Profile = lazy(() => import("./pages/Profile"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const DiretorioGerencial = lazy(() => import("./pages/DiretorioGerencial"));
const PromotionalCards = lazy(() => import("./pages/PromotionalCards"));
const PainelDaRegiaoWrapper = lazy(() => import("./pages/PainelDaRegiaoWrapper"));
const ProcedimentosSSCWrapper = lazy(() => import("./pages/ProcedimentosSSCWrapper"));

// Páginas que não precisam de lazy loading (são pequenas ou críticas)
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";

// Componentes de debug/demonstração
import { DarkModeHoverDemo } from "./components/debug/DarkModeHoverDemo";

// Componente de loading para Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue-600"></div>
  </div>
);

// Wrapper para páginas com lazy loading
interface LazyPageWrapperProps {
  children: React.ReactNode;
}

const LazyPageWrapper = ({ children }: LazyPageWrapperProps) => (
  <Suspense fallback={<PageLoader />}>
    <AppLayout>{children}</AppLayout>
  </Suspense>
);

const AppRoutes = () => {
  const { isLoading } = useAuth();
  
  // Se a autenticação ainda estiver carregando, mostrar um spinner simples
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/calculadora-igreen" element={<CalculadoraIgreenWrapper />} />
      <Route
        path="/painel-da-regiao"
        element={
          <Suspense fallback={<PageLoader />}>
            <PainelDaRegiaoWrapper />
          </Suspense>
        }
      />
      <Route
        path="/procedimentos-ssc"
        element={
          <Suspense fallback={<PageLoader />}>
            <ProcedimentosSSCWrapper />
          </Suspense>
        }
      />

      {/* Rota de redefinição de senha - pública e acessível sem autenticação */}
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Rotas protegidas com lazy loading */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <HubProdutividade />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cards-promocionais" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <PromotionalCards />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/crediario" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <Crediario />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/moveis" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <Moveis />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/moda" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <Moda />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/pdf-viewer" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <PdfViewerPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/perfil" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <Profile />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gerenciar-usuarios" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <UserManagement />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/diretorio-gerencial" 
        element={
          <ProtectedRoute>
            <LazyPageWrapper>
              <DiretorioGerencial />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />


      
      {/* Rotas de debug/demonstração */}
      <Route 
        path="/debug/dark-hover" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <DarkModeHoverDemo />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
