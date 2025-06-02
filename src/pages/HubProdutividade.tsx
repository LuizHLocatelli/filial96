import { HubProdutividade as HubProdutividadeComponent } from "@/components/moveis/hub-produtividade/HubProdutividade";

export default function HubProdutividade() {
  // Sempre renderizar em tela cheia, o componente HubProdutividade 
  // agora tem sua própria navegação integrada na header
  return (
    <div className="min-h-screen bg-background">
      <HubProdutividadeComponent />
    </div>
  );
} 