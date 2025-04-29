
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import EntregasRetiradas from "./pages/EntregasRetiradas";
import Montagens from "./pages/Montagens";
import Garantias from "./pages/Garantias";
import Organizacao from "./pages/Organizacao";
import Cobrancas from "./pages/Cobrancas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/entregas" element={<AppLayout><EntregasRetiradas /></AppLayout>} />
          <Route path="/montagens" element={<AppLayout><Montagens /></AppLayout>} />
          <Route path="/garantias" element={<AppLayout><Garantias /></AppLayout>} />
          <Route path="/organizacao" element={<AppLayout><Organizacao /></AppLayout>} />
          <Route path="/cobrancas" element={<AppLayout><Cobrancas /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
